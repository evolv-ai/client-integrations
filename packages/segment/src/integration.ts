import { SegmentAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new SegmentAdapter(config.maxWaitTime);
}
