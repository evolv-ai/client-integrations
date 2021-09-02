import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class GaAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public readonly trackingId: string,
        public readonly namespace: string,
        public readonly maxWaitTime = 5000,
        public readonly includeCidEid = false
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return (window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga;
    }

    getHandler() {
        return this.getAnalytics();
    }

    checkAnalyticsProviders() {
        // @ts-ignore
        if (window.google_tag_manager || window.gtag) {
            console.log('Evolv: Analytics integration detected Google Tag Manager - please use \'Evolv.GtagClient()\'');
        }
    }

    sendMetrics(type: string, event: any) {
        const namespace = this.namespace;
        const prefix = namespace ? namespace + '.' : '';
        var augmentedSid = this.getAugmentedSid();
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);
        let augmentedGroupId = this.getAugmentedGroupId(event);
        let augmentedOrdinal = this.getAugmentedOrdinal(event);

        this.emit('create', this.trackingId, 'auto', namespace ? {namespace} : null);

        let evolvEvent = 'evolv-event';

        let groupActionString;
        if (augmentedOrdinal) {
            groupActionString = `${evolvEvent}:${augmentedGroupId}:${augmentedOrdinal}`;

            if (this.includeCidEid) {
                groupActionString += `:${augmentedCidEid}`;
            }
        } else if (augmentedCidEid) {
            groupActionString = `${evolvEvent}:${augmentedCidEid}`;
        } else {
            groupActionString = `${evolvEvent}`;
        }

        this.emit(prefix + 'send', 'event', {
            'eventCategory': 'evolvids',
            'eventAction': groupActionString,
            'eventLabel': type + ':' + augmentedUid + ':' + augmentedSid,
            'nonInteraction': true
        });
    }
}
