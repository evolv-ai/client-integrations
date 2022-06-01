import { collect, mutate } from '@evolv/mutate';

export interface Config {}

export function integration(config: Config): void {
	window.evolv ??= {};

	window.evolv.collect ??= collect;
	window.evolv.mutate ??= mutate;
}
