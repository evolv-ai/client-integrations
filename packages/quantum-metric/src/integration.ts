import { QuantumNotifierAdapter } from './notifier-adapter';
import { QuantumDataLayerAdapter } from './data-layer-adapter';

export interface Config {
	dataAdapter: {
		listenersParameters: Record<string, string>,
		parametersToReadFromQuantum: Record<string, boolean>,
	},
	maxWaitTime?: number;
}

export function integration(config: Config): void {
	new QuantumNotifierAdapter(config.maxWaitTime);

	config.dataAdapter = config.dataAdapter || {};
	new QuantumDataLayerAdapter(config.dataAdapter.listenersParameters, config.dataAdapter.parametersToReadFromQuantum, config.maxWaitTime);
}
