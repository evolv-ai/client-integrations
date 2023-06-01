import { TagManagerAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
	dataLayerName?: string;
}

export function integration(config: Config): void {
	new TagManagerAdapter(config.maxWaitTime, config.dataLayerName);
}
