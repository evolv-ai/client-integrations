import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentNotifierAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public parametersToReadFromSegment: Record<string, any> = {},
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    getAnalytics() {
        // @ts-ignore
        return window.analytics && window.analytics.track;
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
        const isEvolvEvent = (name: string) => {
            const eventsMap = Object.values(this.parametersToReadFromSegment);

            if (Array.isArray(this.parametersToReadFromSegment[name])) {
                this.parametersToReadFromSegment[name].forEach(({ event }: { event: string }) => {
                    eventsMap.push(event);
                });
            } 

            return eventsMap.indexOf(type) === -1;
        };

        if (type === 'confirmed' && event.group_id) {
            const combinationName = `Combination ${event.ordinal}`;
            const experimentName = `Experiment: Evolv Optimization ${event.group_id}`;

            this.emit('Experiment Viewed', {
                experiment_id: event.eid,
                experiment_name: experimentName,
                variation_id: event.cid,
                variation_name: combinationName,
                nonInteraction: 1
            });
        } else if (isEvolvEvent(type)) {
            this.emit(`Evolv Event: ${type}`, value);
        }
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
