import {Client} from "./Client";

export class GtagClient extends Client {
    constructor(
        public readonly trackingId: string,
        public readonly userIdDimension: string,
        public readonly experimentIdDimension?: string,
        public readonly maxWaitTime = 5000
    ) {
        super(trackingId, maxWaitTime);
    }

    getAnalytics() {
        return window.gtag;
    }

    sendMetrics(type: string, event: any) {
        let dataMap: { [key: string]: any; } = {
            'non_interaction': true
        };

        if (this.experimentIdDimension) {
            dataMap['dimension' + this.experimentIdDimension] = event.eid;
        }
        dataMap['dimension' + this.userIdDimension] = event.uid;

        this.emit('event', 'evolv-' + type + (event.cid ? '-' + event.cid : ''), dataMap);
    }
}
