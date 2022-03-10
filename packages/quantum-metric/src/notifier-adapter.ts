import {AnalyticsHandler, AnalyticsNotifierAdapter} from '@evolv-integrations/analytics-adapter';

const EVOLV_EVENT_ID = 1;

export class QuantumNotifierAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return window.QuantumMetricAPI;
    }

    getHandler(): AnalyticsHandler {
        return (data) => {
            window.evolvQuantumDataLayer = window.evolvQuantumDataLayer || [];
            window.evolvQuantumDataLayer.push(data);
        };
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

        this.emit(value);
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
