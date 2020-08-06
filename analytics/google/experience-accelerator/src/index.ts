export class GAClient {
    queue: any[] = [];
    interval: number = 50;

    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly candidateIdMetric: string,
        public readonly experimentIdMetric: string,
        public readonly userIdMetric: string,
        public readonly maxWaitTime = 5000
    ) {
        this.waitForGA();
        this.waitForEvolv(this.configureListeners.bind(this));
    }

    private configureListeners() {
        window.evolv.client.on('confirmed', (type: string) => {
            this.sendMetricsForActiveCandidates('confirmed');
        });

        window.evolv.client.on('contaminated', (type: string) => {
            this.sendMetricsForActiveCandidates('contaminated');
        });

        window.evolv.client.on('event.emitted', (type: any, name: string) => {
            this.sendMetrics(name, { uid : window.evolv.context.uid });
        });
    }

    sendMetricsForActiveCandidates(type: string) {
        var allocations = this.getEvolv().client.context.get('experiments').allocations;

        for (let i = 0; i < allocations.length; i++) {
            const allocation = allocations[i];
            this.sendMetrics(type, allocation);
        }
    }

    getEvolv() {
        return window.evolv;
    }

    getGa() {
        // @ts-ignore
        return (window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga;
    }

    waitForEvolv(functionWhenReady: Function) {
        if (this.getEvolv()) {
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('Evolv: GA integration timed out - couldn\'t find Evolv');
                return;
            }

            const evolv = this.getEvolv();
            if (!evolv) {
                return;
            }

            functionWhenReady();

            clearInterval(intervalId);
        }, this.interval);
    }

    waitForGA() {
        if (this.getGa()) {
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('Evolv: GA integration timed out - Couldn\'t find GA');
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
        }, this.interval);
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
        const namespace = this.namespace;
        const prefix = namespace ? namespace + '.' : '';
        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

        this.emit(prefix + 'set', 'dimension' + this.candidateIdMetric, event.cid);
        this.emit(prefix + 'set', 'dimension' + this.experimentIdMetric, event.eid);
        this.emit(prefix + 'set', 'dimension' + this.userIdMetric, event.uid);

        this.emit(prefix + 'send', 'event', 'evolv', 'evolv-' + type, { nonInteraction: true });
    }
}
