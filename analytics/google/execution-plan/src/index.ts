export class GAClient {
    queue: any[] = [];

    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly userIdDimension: string,
        public readonly experimentIdDimension?: string,
        public readonly maxWaitTime = 5000
    ) {

        this.ensureListeners();
        this.waitForGA();

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

    getGa() {
        // @ts-ignore
        return (window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga;
    }

    waitForGA() {
        if (this.getGa()) {
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('[Evolv] GA integration timed out.');
                return;
            }

            const ga = this.getGa();
            if (!ga) {
                return;
            }

            let args;
            while(this.queue.length) {
                args = this.queue.shift();
                ga(...args);
            }

            clearInterval(intervalId);
        }, 50);
    }

    private emit(...args: any[]) {
        const ga = this.getGa();
        if (ga) {
            ga(...args);
        } else {
            this.queue.push(args);
        }
    }

    private sendMetrics(type: string, event: any) {
        window.evolv.scout.then((scout: any) => {
            const namespace = this.namespace;
            const prefix = namespace ? namespace + '.' : '';
            this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

            if (this.experimentIdDimension) {
                this.emit(prefix + 'set', 'dimension' + this.experimentIdDimension, event.experimentId);
            }

            this.emit(prefix + 'set', 'dimension' + this.userIdDimension, scout.tracker.uid);

            this.emit(prefix + 'send', 'event', 'evolv', 'evolv-' + type + (event.candidateId ? '-' + event.candidateId : ''), { nonInteraction: true });
        });
    }
}
