import {Client} from "./Client";

export class GtagClient extends Client {
    constructor(
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
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
            let cidEid = event.cid.split(':');
            augmentedCidEid = 'cid-' + cidEid[0] + ':eid-' + cidEid[1];

            let remaining = cidEid.slice(2).join(':');
            if (remaining) {
                augmentedCidEid = augmentedCidEid + ':' + remaining;
            }
        }

        dataMap['event_category'] = 'evolvids';
        dataMap['event_label'] = type + ':' + augmentedUid + ':' + augmentedSid;

        this.emit('event', 'evolv-event' + (augmentedCidEid ? ':' + augmentedCidEid : ''), dataMap);
    }
}
