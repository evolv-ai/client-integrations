
export abstract class Awaiter {
    public interval: number = 50;

    constructor(public readonly maxWaitTime = 5000) {
        /*
        In the extending class, call the following in the constructor
         this.waitForAnalytics();
         this.waitForEvolv();
        */
    }

    abstract getAnalytics(): any;
    abstract checkAnalyticsProviders(): void; // Optional check for incorrect configuration

    abstract onAnalyticsFound(analytics: any): void;
    abstract onEvolvFound(): void;

    // Override for customer analytics processor
    getHandler(): any {
        return this.getAnalytics();
    }

    waitForAnalytics() {
        let analytics = this.getHandler();
        if (analytics) {
            this.onAnalyticsFound(analytics);
            return;
        }

        const begin = Date.now();
        const intervalId = setInterval(() => {
            if ((Date.now() - begin) > this.maxWaitTime) {
                clearInterval(intervalId);
                console.log('Evolv: Analytics integration timed out - Couldn\'t find Analytics');
                this.checkAnalyticsProviders();
                return;
            }

            analytics = this.getHandler();
            if (!analytics) {
                return;
            }

            this.onAnalyticsFound(analytics);

            clearInterval(intervalId);
        }, this.interval);
    }

    getEvolv() {
        return window.evolv;
    }

    waitForEvolv() {
        if (this.getEvolv()) {
            this.onEvolvFound();
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

            this.onEvolvFound();

            clearInterval(intervalId);
        }, this.interval);
    }
}

