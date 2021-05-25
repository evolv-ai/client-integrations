import { GtagClient } from './client';

export interface Config {
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GtagClient(config.maxWaitTime, config.includeCidEid);
}
