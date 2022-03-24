import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentNotifierAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public parametersToReadFromSegment: Record<string, string> = {},
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return window.analytics.track;
    }

    getHandler() {
        return this.getAnalytics();
    }

    sendMetrics(type: string, event: any) {
        let value: Record<string, any> = {
            type
        };

        if (event.group_id) {
            value = Object.assign(value, {
                groupId: event.group_id,
                ordinal: event.ordinal,
                cid: event.cid
            });
        }

        if (Object.values(this.parametersToReadFromSegment).indexOf(type) === -1) {
            this.emit(`Evolv Event: ${type}`, value);
        }
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
