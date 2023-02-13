import {AnalyticsHandler, AnalyticsNotifierAdapter} from '@evolv-integrations/analytics-adapter';

const EVOLV_EVENT_ID = 1;

export class HeapNotifierAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        return window.heap;
    }

    getHandler(): AnalyticsHandler {
        return  this.getAnalytics();
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

        this.emit('evolv-event', value);
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
