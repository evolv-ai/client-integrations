import { Client } from "./Client";

export class GAClient extends Client {
    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly userIdDimension: string,
        public readonly experimentIdDimension?: string,
        public readonly maxWaitTime = 5000
    ) {
        super(trackingId, maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return (window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga;
    }

    sendMetrics(type: string, event: any) {
        const namespace = this.namespace;
        const prefix = namespace ? namespace + '.' : '';
        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

        if (this.experimentIdDimension) {
            this.emit(prefix + 'set', 'dimension' + this.experimentIdDimension, event.eid);
        }

        this.emit(prefix + 'set', 'dimension' + this.userIdDimension, event.uid);

        this.emit(prefix + 'send', 'event', 'evolv', 'evolv-' + type + (event.cid ? '-' + event.cid : ''), { nonInteraction: true });
    }
}
