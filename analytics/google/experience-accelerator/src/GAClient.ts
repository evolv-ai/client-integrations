import { Client } from "./Client";

export class GAClient extends Client {
    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly sessionIdDimension: string,
        public readonly candidateIdDimension: string,
        public readonly userIdDimension: string,
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
        var augmentedSid = '';
        var augmentedCidEid = '';
        var augmentedUid = '';

        if (window.evolv.context.sid) {
            augmentedSid = 'sid-' + window.evolv.context.sid;
        }

        if (event.uid) {
            augmentedUid = "uid-" + event.uid;
        }

        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

        if (event.cid) {
            var cidEid = event.cid.split(':');
            augmentedCidEid = 'cid-' + cidEid[0] + ':eid-' + cidEid[1];

            let remaining = cidEid.slice(2).join(':');
            if (remaining) {
                augmentedCidEid = augmentedCidEid + ':' + remaining;
            }
        } else {
            augmentedCidEid = '';
        }
        this.emit(prefix + 'set', 'dimension' + this.candidateIdDimension, augmentedCidEid);

        this.emit(prefix + 'set', 'dimension' + this.userIdDimension, augmentedUid);
        this.emit(prefix + 'set', 'dimension' + this.sessionIdDimension, augmentedSid);

        this.emit(prefix + 'send', 'event', { 
            'eventCategory': 'evolvids',
            'eventAction': augmentedCidEid,
            'eventLabel': type + ':' + augmentedUid + ':' + augmentedSid,
            'nonInteraction': true
        });
    }
}
