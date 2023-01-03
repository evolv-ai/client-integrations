import { GtagServersideAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GtagServersideAdapter(config.maxWaitTime, config.includeCidEid);
}
