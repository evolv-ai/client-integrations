import { SegmentNotifierAdapter } from './notifier-adapter';
import { SegmentEventListenerAdapter } from './event-listener-adapter';

export interface Config {
    eventListenerAdapter: {
        parametersToReadFromSegment: Record<string, string>
    },
    maxWaitTime?: number;
}

export function integration(config: Config): void {
    const segmentNotifier = new SegmentNotifierAdapter(config.maxWaitTime);

    config.eventListenerAdapter = config.eventListenerAdapter || {};
    config.eventListenerAdapter.parametersToReadFromSegment = config.eventListenerAdapter.parametersToReadFromSegment || {};
    const segmentEventListener = new SegmentEventListenerAdapter(config.eventListenerAdapter.parametersToReadFromSegment, config.maxWaitTime);
}
