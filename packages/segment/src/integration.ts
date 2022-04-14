import { SegmentNotifierAdapter } from './notifier-adapter';
import { SegmentEventListenerAdapter } from './event-listener-adapter';

export interface Config {
    eventListenerAdapter: {
        parametersToReadFromSegment: Record<string, any>,
        experimentNames: Record<string, string>
    },
    maxWaitTime?: number;
}

export function integration(config: Config): void {
    config.eventListenerAdapter = config.eventListenerAdapter || { parametersToReadFromSegment: {} };
    config.eventListenerAdapter.parametersToReadFromSegment = config.eventListenerAdapter.parametersToReadFromSegment || {};
    config.eventListenerAdapter.experimentNames = config.eventListenerAdapter.experimentNames || {};

    const segmentNotifier = new SegmentNotifierAdapter(config.eventListenerAdapter.parametersToReadFromSegment, config.eventListenerAdapter.experimentNames, config.maxWaitTime);
    const segmentEventListener = new SegmentEventListenerAdapter(config.eventListenerAdapter.parametersToReadFromSegment, config.maxWaitTime);
}
