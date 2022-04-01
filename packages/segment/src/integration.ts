import { SegmentNotifierAdapter } from './notifier-adapter';
import { SegmentEventListenerAdapter } from './event-listener-adapter';

export interface Config {
    eventListenerAdapter: {
        parametersToReadFromSegment: Record<string, any>
    },
    maxWaitTime?: number;
}

export function integration(config: Config): void {
    config.eventListenerAdapter = config.eventListenerAdapter || { parametersToReadFromSegment: {} };
    config.eventListenerAdapter.parametersToReadFromSegment = config.eventListenerAdapter.parametersToReadFromSegment || {};
    const segmentNotifier = new SegmentNotifierAdapter(config.eventListenerAdapter.parametersToReadFromSegment, config.maxWaitTime);
    const segmentEventListener = new SegmentEventListenerAdapter(config.eventListenerAdapter.parametersToReadFromSegment, config.maxWaitTime);
}
