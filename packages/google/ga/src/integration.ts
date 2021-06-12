import { GaAdapter } from './adapter';

export interface Config {
	trackingId: string;
	namespace: string;
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GaAdapter(config.trackingId, config.namespace, config.maxWaitTime);
}
