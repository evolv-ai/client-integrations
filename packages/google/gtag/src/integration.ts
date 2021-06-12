import { GtagAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GtagAdapter(config.maxWaitTime, config.includeCidEid);
}
