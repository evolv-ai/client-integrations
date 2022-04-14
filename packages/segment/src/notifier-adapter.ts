import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentNotifierAdapter extends AnalyticsNotifierAdapter {
    constructor(
        public parametersToReadFromSegment: Record<string, any> = {},
        public experimentNames: Record<string, string> = {},
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

        // Checks if event name is in the list of Segment events
        const isSegmentEvent = (name: string) => {
            const eventsMap = Object
                .values(this.parametersToReadFromSegment)
                .map(param =>
                    Array.isArray(param)
                        ? param.map(({ event }: { event: string }) => event)
                        : param
                )
                .reduce((acc, curr) => acc.concat(curr), []);

            return eventsMap.indexOf(name) !== -1;
        };

        if (type === 'confirmed' || type === 'contaminated') {
            const experimentMetaData: any = {};
            const eventName = type === 'confirmed' ? 'Experiment Viewed' : 'Experiment Contaminated';
            const experimentName = this.experimentNames[event.group_id] || `Experiment: Evolv Optimization ${event.group_id}`;
            if (event.group_id) {
                experimentMetaData.experiment_id = event.eid;
                experimentMetaData.experiment_name = experimentName;
                experimentMetaData.variation_id = event.cid;
                experimentMetaData.variation_name = `Combination ${event.ordinal}`;
            }

            this.emit(eventName, {
                nonInteraction: 1,
                ...experimentMetaData
            });
        } else if (!isSegmentEvent(type)) {
            this.emit(`Evolv Event: ${type}`, value);
        }
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
