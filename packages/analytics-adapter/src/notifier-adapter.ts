import {AnalyticsHandler, Awaiter} from "./awaiter";

interface ActiveCandidateEvents {
	confirmed: Record<string, any>;
	contaminated: Record<string, any>;
}

export abstract class AnalyticsNotifierAdapter extends Awaiter {
	protected queue: any[] = [];
	public interval: number = 50;
	protected activeCandidateEvents: ActiveCandidateEvents = {
		confirmed: {},
		contaminated: {}
	};
	protected contaminations: any = {};

	constructor(public readonly maxWaitTime = 5000) {
		super(maxWaitTime);

		this.waitForAnalytics();
		this.waitForEvolv();
	}

	onAnalyticsFound() {
		const handler = this.getHandler();
		while (this.queue.length) {
			const args = this.queue.shift();
			handler(...args);
		}
	}

	onEvolvFound() {
		this.configureListeners();
	}

	private configureListeners() {
		window.evolv.client.on('confirmed', (type: keyof ActiveCandidateEvents) => {
			this.sendMetricsForActiveCandidates(type);
		});

		window.evolv.client.on('contaminated', (type: keyof ActiveCandidateEvents) => {
			this.sendMetricsForActiveCandidates(type);
		});

		window.evolv.client.on('event.emitted', (type: any, name: string) => {
			this.sendMetrics(name, {uid: window.evolv.context.uid});
		});
	}

	sendMetricsForActiveCandidates(type: keyof ActiveCandidateEvents) {
		let contextKey = AnalyticsNotifierAdapter.getContextKey(type);
		let candidates = this.getEvolv().context.get(contextKey) || [];
		for (let i = 0; i < candidates.length; i++) {
			if (this.activeCandidateEvents[type] && !this.activeCandidateEvents[type][candidates?.[i]?.cid]) {
				const allocation = this.lookupFromAllocations(candidates[i].cid);
				this.sendMetrics(type, allocation);
				this.activeCandidateEvents[type][candidates[i].cid] = true;
			}
		}
	}

	private lookupFromAllocations(cid: string) {
		let allocations = this.getEvolv().context.get('experiments').allocations;
		for (let i = 0; i < allocations.length; i++) {
			const allocation = allocations[i];

			if (allocation.cid === cid) {
				return allocation;
			}
		}
	}

	private static getContextKey(type: string) {
		switch (type) {
			case 'confirmed':
				return 'experiments.confirmations';
			case 'contaminated':
				return 'experiments.contaminations';
			default:
				return '';
		}
	}

	getAugmentedOrdinal(event: any) {
		if (event.ordinal === undefined) {
			return;
		}
		return 'ordinal-' + event.ordinal;
	}

	getDisplayName(event: any) {
		if (!event.cid) {
			return;
		}
		let cidEid = event.cid.split(':');
		let eid = cidEid[1];
		return window.evolv.client.getDisplayName('experiments', eid);
	}

	getAugmentedGroupId(event: any) {
		if (!event.group_id) {
			return;
		}
		return 'gid-' + event.group_id;
	}

	getAugmentedCidEid(event: any) {
		let augmentedCidEid;
		if (event.cid) {
			var cidEid = event.cid.split(':');
			augmentedCidEid = 'cid-' + cidEid[0] + ':eid-' + cidEid[1];

			let remaining = cidEid.slice(2).join(':');
			if (remaining) {
				augmentedCidEid = augmentedCidEid + ':' + remaining;
			}
		} else {
			augmentedCidEid = '';
		}

		return augmentedCidEid;
	}

	getAugmentedUid(event: any) {
		let augmentedUid = '';
		if (event.uid) {
			augmentedUid = "uid-" + event.uid;
		}
		return augmentedUid;
	}

	getAugmentedSid() {
		let augmentedSid = '';
		if (window.evolv.context.sid) {
			augmentedSid = 'sid-' + window.evolv.context.sid;
		}

		return augmentedSid;
	}

	protected emit(...args: any[]) {
		const analytics = this.getAnalytics();
		if (analytics) {
			this.getHandler()(...args);
		} else {
			this.queue.push(args);
		}
	}

	abstract sendMetrics(type: string, event: any): void;
	abstract getHandler(): AnalyticsHandler
}
