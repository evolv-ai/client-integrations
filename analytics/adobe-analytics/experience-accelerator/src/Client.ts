export abstract class Client {
    queue: any[] = [];
    interval: number = 50;

    constructor(
        public readonly maxWaitTime = 5000
    ) {
        this.waitForAnalytics();
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
            this.sendMetrics(name, {uid: window.evolv.context.uid});
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

    abstract getAnalytics(): any;

    waitForEvolv(functionWhenReady: Function) {
        if (this.getEvolv()) {
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

            functionWhenReady();

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
