import type { collect, mutate } from '@evolv/mutate';

export {};

declare global {
	interface Evolv {
		mutate?: typeof mutate;
		collect?: typeof collect;
		context?: any;
		client?: any;
	}

	interface Window {
		evolv: Evolv;
	}

	interface MutateContext {
		collectors: Set<string>,
		observing: Set<string>,
		claimed: boolean
	}

	interface Element {
		__evolv__: MutateContext;
	}

	interface HTMLElement {
		__evolv__: MutateContext;
	}
}
