export class GAClient {
    trackingId: string;
    namespace: string;
    candidateIdMetric: string;
    experimentIdMetric: string;
    userIdMetric: string;
    maxWaitTime: number;
    queue: any[] = [];

    constructor(
        trackingId: string,
        namespace: string,
        candidateIdMetric: string,
        experimentIdMetric: string,
        userIdMetric: string,
        maxWaitTime = 5000
    ) {
        this.trackingId = trackingId;
        this.namespace = namespace;
        this.candidateIdMetric = candidateIdMetric;
        this.experimentIdMetric = experimentIdMetric;
        this.userIdMetric = userIdMetric;
        this.maxWaitTime = maxWaitTime;

        this.waitForGA();
        this.waitForEvolv(this.configureListeners);
    }

    private configureListeners() {
        window.evolv.client.on('confirmed', (event: any) => {
            this.getSendMetricsForActiveCandidates('confirmed');
        });

        window.evolv.client.on('contaminated', (event: any) => {
            this.getSendMetricsForActiveCandidates('contaminated');
        });

        window.evolv.client.on('event.emitted', (event: any, type: string) => {
            this.sendMetrics(type, { uid : window.evolv.context.uid });
        });
    }

    private getSendMetricsForActiveCandidates(type: string) {
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
            // @ts-ignore
            if (!evolv) {
                return;
            }

            functionWhenReady.bind(this)();

            clearInterval(intervalId);
        }, 50);
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
            // @ts-ignore
            if (!ga) {
                return;
            }

            let args;
            while(this.queue.length) {
                args = this.queue.pop();
                // @ts-ignore
                ga(...args);
            }

            clearInterval(intervalId);
        }, 50);
    }

    private emit(...args: any[]) {
        const ga = this.getGa();
        if (ga) {
            // @ts-ignore
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
