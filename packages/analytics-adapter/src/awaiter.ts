export type AnalyticsHandler<T extends Array<any> = any[]> = (...args: T) => void;
export type Analytics = object;

export abstract class Awaiter {
    public interval: number = 50;

    constructor(public readonly maxWaitTime = 5000) {
        /*
        In the extending class, call the following in the constructor
         this.waitForAnalytics();
         this.waitForEvolv();
        */
    }

    abstract getAnalytics(): Analytics;
    abstract checkAnalyticsProviders(): void; // Optional check for incorrect configuration

    abstract onAnalyticsFound(): void;
    abstract onEvolvFound(): void;

    waitForAnalytics() {
        if (this.getAnalytics()) {
            this.onAnalyticsFound();
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

            if (!this.getAnalytics()) {
                return;
            }

            this.onAnalyticsFound();

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

