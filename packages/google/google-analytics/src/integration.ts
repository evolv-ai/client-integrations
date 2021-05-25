import { GAClient } from './client';

export interface Config {
	trackingId: string;
	namespace: string;
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GAClient(config.trackingId, config.namespace, config.maxWaitTime);
}
