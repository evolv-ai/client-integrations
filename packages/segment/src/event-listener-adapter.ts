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
        this.getAnalytics().ready(() => {
            this.getAnalytics().on('track', (name: string) => {
                if (this.parametersToReadFromSegment[name]) {
                    this.emitEvent(this.parametersToReadFromSegment[name]);
                }
            });
        });
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
