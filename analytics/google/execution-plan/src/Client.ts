export abstract class Client {
    queue: any[] = [];
    interval: number = 50;
    activeCandidateEvents: any = {
        confirmed: {},
        contaminated: {}
    };
    contaminations: any = {};

    constructor(
        public readonly maxWaitTime = 5000
    ) {
        this.ensureListeners();
        this.waitForAnalytics();
        this.configureListeners();
    }

    private configureListeners() {
        const original = window.evolvPreload.listeners.rendered;
        window.evolvPreload.listeners.rendered = (event: any) => {
            this.sendMetrics('rendered', event);
            original && original(event);
        };

        const original2 = window.evolvPreload.listeners.notrendered;
        window.evolvPreload.listeners.notrendered = (event: any) => {
            this.sendMetrics('notrendered', event);
            original2 && original2(event);
        };

        const original3 = window.evolvPreload.listeners.triggered;
        window.evolvPreload.listeners.triggered = (event: any) => {
            this.sendMetrics(event.data.type, event.data);
            original3 && original3(event);
        };
    }

    ensureListeners() {
        if (!window.evolvPreload) {
            window.evolvPreload = {};
        }

        if (!window.evolvPreload.listeners) {
            window.evolvPreload.listeners = {};
        }
    }

    abstract getAnalytics(): any;

    // Override for customer analytics processor
    getHandler(): any {
        return this.getAnalytics();
    }

    waitForAnalytics() {
        if (this.getAnalytics()) {
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('Evolv: Analytics integration timed out - Couldn\'t find Analytics');
                return;
            }

            const analytics = this.getHandler();
            if (!analytics) {
                return;
            }

            let args;
            while (this.queue.length) {
                args = this.queue.shift();
                analytics(...args);
            }

            clearInterval(intervalId);
        }, this.interval);
    }

    getAugmentedCidEid(event: any) {
        let augmentedCidEid;
        if (event.candidateId) {
            var cidEid = event.candidateId.split(':');
            augmentedCidEid = 'cid-' + cidEid[0] + ':eid-' + cidEid[1];

            let remaining = cidEid.slice(2).join(':');
            if (remaining) {
                augmentedCidEid = augmentedCidEid + ':' + remaining;
            }
        } else {
            augmentedCidEid = '';
        }

        return augmentedCidEid;
    }

    getAugmentedUid(tracker: any) {
        let augmentedUid = '';
        if (tracker.uid) {
            augmentedUid = "uid-" + tracker.uid;
        }
        return augmentedUid;
    }

    getAugmentedSid(tracker: any) {
        let augmentedSid = '';
        if (tracker.sid) {
            augmentedSid = 'sid-' + tracker.sid;
        }

        return augmentedSid;
    }

    protected emit(...args: any[]) {
        const analytics = this.getAnalytics();
        if (analytics) {
            analytics(...args);
        } else {
            this.queue.push(args);
        }
    }

    abstract sendMetrics(type: string, event: any): void;
}
