import { AaAdapter } from './adapter';

export type Dimensions =  "user" | "candidate" | "group" | "ordinal"
export type DimensionsValue = { key: string, type?: string };
export type DimensionsMap = { [dimension in Dimensions]?: DimensionsValue};

export interface Config {
	dimensions: DimensionsMap;
	maxWaitTime?: number;
	customEventHandler?: () => {};
}

export function integration(config: Config): void {
	new AaAdapter(config.dimensions, config.maxWaitTime, config.customEventHandler);
}
