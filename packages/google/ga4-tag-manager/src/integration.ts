import { TagManagerAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new TagManagerAdapter(config.maxWaitTime);
}
