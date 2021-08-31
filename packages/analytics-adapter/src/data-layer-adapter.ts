import {Awaiter} from "./awaiter";

export abstract class DataLayerAdapter extends Awaiter {
    evolvReady = false;
    dataToApplyWhenEvolvReady: Record<string, any>[] = [];

    constructor(public readonly maxWaitTime = 5000) {
        super(maxWaitTime);

        this.waitForAnalytics();
        this.waitForEvolv();
    }

    onAnalyticsFound() {
        this.setOnContext(this.getAnalyticsContextData());
        this.addListenersForContextData();
    };

    onEvolvFound() {
        this.evolvReady = true;

        if (this.dataToApplyWhenEvolvReady.length) {
            this.applyContextData(this.dataToApplyWhenEvolvReady);
            this.dataToApplyWhenEvolvReady = [];
        }
    };

    setOnContext(data: {[key:string]: any}) {
        if (!this.evolvReady) {
            this.dataToApplyWhenEvolvReady.push(data);
        } else {
            this.applyContextData([data])
        }
    }

    applyContextData(datas: {[key:string]: any}[]) {
        datas.forEach(data => {
            this.getEvolv().context.update(data)
        });
    }

    abstract getAnalyticsContextData(): {[key:string]: any};
    abstract addListenersForContextData(): void // call setOnContext with the retrieved data
}
