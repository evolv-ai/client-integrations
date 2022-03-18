import { EventListenerAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentEventListenerAdapter extends EventListenerAdapter {
    constructor(
        public parametersToReadFromSegment: Record<string, string> = {},
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);

        this.parametersToReadFromSegment = parametersToReadFromSegment || {};
    }

    getAnalytics() {
        // @ts-ignore
        return window.analytics;
    }

    addListenersForEventData(): void {
        this.getAnalytics().addEventListener('track', (evt: any) => {
            const { event } = evt;

            if (this.parametersToReadFromSegment[event]) {
                this.emitEvent(this.parametersToReadFromSegment[event]);
            }
        });
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
