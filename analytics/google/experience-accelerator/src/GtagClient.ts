import {Client} from "./Client";

export class GtagClient extends Client {
    constructor(
        public readonly trackingId: string,
        public readonly sessionIdDimension: string,
        public readonly candidateIdDimension: string,
        public readonly userIdDimension: string,
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

        var augmentedSid = '';
        var augmentedCidEid = '';
        var augmentedUid = '';

        if (window.evolv.context.sid) {
            augmentedSid = 'sid-' + window.evolv.context.sid;
        }

        if (event.uid) {
            augmentedUid = "uid-" + event.uid;
        }

        if (event.cid) {
            var cidEid = event.cid.split(':');
            augmentedCidEid = 'cid-' + cidEid[0] + ':eid-' + cidEid[1];
            dataMap['dimension' + this.candidateIdDimension] = augmentedCidEid;
        }

        dataMap['dimension' + this.userIdDimension] = augmentedUid;
        dataMap['dimension' + this.sessionIdDimension] = augmentedSid;
        dataMap['event_category'] = 'evolvids';
        dataMap['event_label'] = type + ':' + augmentedUid + ':' + augmentedSid;

        this.emit('event', augmentedCidEid, dataMap);
    }
}
