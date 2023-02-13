import { HeapNotifierAdapter } from './notifier-adapter';

export interface Config {
	dataAdapter: {
		listenersParameters: Record<string, string>
	},
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new HeapNotifierAdapter(config.maxWaitTime);
}
