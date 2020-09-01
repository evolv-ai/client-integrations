import { Client } from "./Client";

export class AAClient extends Client {
    constructor(
        public readonly userIdDimension: string,
        public readonly experimentIdDimension?: string,
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        return (window.s && window.s.tl);
    }

    sendMetrics(type: string, event: any) {
        var y: any = new Object();

        y.linkTrackVars = 'eVar' + this.userIdDimension + (this.experimentIdDimension ? ',eVar' + this.experimentIdDimension : '') + ',events';
        y.linkTrackEvents = 'events';
        y.events = 'evolv-' + type + (event.cid ? '-' + event.cid : '');

        if (this.experimentIdDimension) {
            y['eVar' + this.experimentIdDimension] = event.eid
        }
        y['eVar' + this.userIdDimension] = event.uid;

        this.emit(this,'o', 'evolv-' + type + (event.cid ? '-' + event.cid : ''), y);
    }
}
