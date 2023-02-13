import { HeapNotifierAdapter } from './notifier-adapter';

export interface Config {
	dataAdapter: {
		listenersParameters: Record<string, string>,
		parametersToReadFromQuantum: Record<string, boolean>,
	},
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new HeapNotifierAdapter(config.maxWaitTime);
}
