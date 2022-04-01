import { EventListenerAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentEventListenerAdapter extends EventListenerAdapter {
    constructor(
        public parametersToReadFromSegment: Record<string, any> = {},
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
            // @ts-ignore
            const getSegmentDataLayerEvents = window.dataLayer
                && window.dataLayer.filter(event => event.hasOwnProperty('segmentAnonymousId'));

            if (getSegmentDataLayerEvents.length > 0) {
                getSegmentDataLayerEvents.forEach(({ event: name, ...properties }) => {
                    this.handleEvent(name, properties);
                });

            }
            this.getAnalytics().on('track', (name: string, properties: any) => {
                this.handleEvent(name, properties);
            });
        });
    }

    handleEvent(name: string, properties: any) {
        if (this.parametersToReadFromSegment[name]) {
            if (Array.isArray(this.parametersToReadFromSegment[name])) {
                const conditions = this.parametersToReadFromSegment[name];
                conditions.forEach(({ condition, event }: { condition: any, event: string }) => {
                    const match = Object.keys(condition).every(key => {
                        if (key in properties) {
                            return properties[key] === condition[key];
                        }
                    });

                    if (match) {
                        this.emitEvent(event);
                    }
                });
            } else {
                this.emitEvent(this.parametersToReadFromSegment[name]);
            }
        }
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }
}
