class EvolvGAClient {
    trackingId: string;
    namespace: string;
    candidateIdMetric: string;
    userIdMetric: string;
    maxWaitTime: number;
    queue: any[] = [];

    constructor(
        trackingId: string,
        namespace: string,
        candidateIdMetric: string,
        userIdMetric: string,
        maxWaitTime = 5000
    ) {
        this.trackingId = trackingId;
        this.namespace = namespace;
        this.candidateIdMetric = candidateIdMetric;
        this.userIdMetric = userIdMetric;
        this.maxWaitTime = maxWaitTime;

        this.ensureListeners();
        this.waitForGA();

        const original = window.evolvPreload.listeners.rendered;
        window.evolvPreload.listeners.rendered = (event: any) => {
            this.sendMetrics(event);
            original(event);
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
                console.log('Evolv: GA integration timed out.');
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

    private sendMetrics(event: any) {
        const namespace = this.namespace;
        const prefix = namespace ? namespace + '.' : '';
        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);
        this.emit(prefix + 'set', 'dimension' + this.candidateIdMetric, event.experimentId + '-' + event.candidateId);
        this.emit(prefix + 'set', 'dimension' + this.userIdMetric, event.experimentId + '-' + event.candidateId);
        this.emit(prefix + 'send', 'event', 'evolv', 'evolvRendered', { nonInteraction: true });
    }
}
