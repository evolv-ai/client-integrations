export abstract class Client {
    queue: any[] = [];
    interval: number = 50;

    constructor(
        public readonly trackingId: string,
        public readonly maxWaitTime = 5000
    ) {
        this.waitForAnalytics();
        this.waitForEvolv(this.configureListeners.bind(this));
    }

    private configureListeners() {
        window.evolv.client.on('confirmed', (type: string) => {
            this.sendMetricsForActiveCandidates(type);
        });

        window.evolv.client.on('contaminated', (type: string) => {
            this.sendMetricsForActiveCandidates(type);
        });

        window.evolv.client.on('event.emitted', (type: any, name: string) => {
            this.sendMetrics(name, {uid: window.evolv.context.uid});
        });
    }

    sendMetricsForActiveCandidates(type: string) {
        let contextKey = this.getContextKey(type);
        let candidates = this.getEvolv().context.get(contextKey) || [];
        for (let i = 0; i < candidates.length; i++) {
            const allocation = this.lookupFromAllocations(candidates[i].cid);
            this.sendMetrics(type, allocation);
        }
    }

    private lookupFromAllocations(cid: string) {
        let allocations = this.getEvolv().context.get('experiments').allocations;
        for (let i = 0; i < allocations.length; i++) {
            const allocation = allocations[i];

            if (allocation.cid === cid) {
                return allocation;
            }
        }
    }

    private getContextKey(type: string) {
        switch (type) {
            case 'confirmed':
                return 'confirmations';
            case 'contaminated':
                return 'contaminations';
            default:
                return '';
        }
    }

    getEvolv() {
        return window.evolv;
    }

    abstract getAnalytics(): any;

    waitForEvolv(functionWhenReady: Function) {
        if (this.getEvolv()) {
            functionWhenReady && functionWhenReady();
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('Evolv: Analytics integration timed out - couldn\'t find Evolv');
                return;
            }

            const evolv = this.getEvolv();
            if (!evolv) {
                return;
            }

            functionWhenReady && functionWhenReady();

            clearInterval(intervalId);
        }, this.interval);
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

            const analytics = this.getAnalytics();
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
