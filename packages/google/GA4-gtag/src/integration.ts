import { GtagAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new GtagAdapter(config.maxWaitTime);
}
