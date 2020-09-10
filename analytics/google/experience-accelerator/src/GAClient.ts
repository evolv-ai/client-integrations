import { Client } from "./Client";

export class GAClient extends Client {
    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return (window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga;
    }

    sendMetrics(type: string, event: any) {
        const namespace = this.namespace;
        const prefix = namespace ? namespace + '.' : '';
        var augmentedSid = this.getAugmentedSid();
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);

        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

        this.emit(prefix + 'send', 'event', { 
            'eventCategory': 'evolvids',
            'eventAction': 'evolv-event' + (augmentedCidEid ? ':' + augmentedCidEid : ''),
            'eventLabel': type + ':' + augmentedUid + ':' + augmentedSid,
            'nonInteraction': true
        });
    }
}
