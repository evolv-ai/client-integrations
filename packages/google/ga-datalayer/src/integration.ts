import { GaDataLayerAdapter } from './adapter';

export interface Config {
	maxWaitTime?: number;
	includeCidEid?: boolean;
}

export function integration(config: Config): void {
	new GaDataLayerAdapter(config.maxWaitTime, config.includeCidEid);
}
