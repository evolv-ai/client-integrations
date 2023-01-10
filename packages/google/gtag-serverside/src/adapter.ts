import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class GtagServersideAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000,
		public readonly includeCidEid = false
	) {
		super(maxWaitTime);
	}

	getAnalytics() {
		return window.dataLayer.push;
	}

	getHandler() {
		return this.getAnalytics();
	}

	checkAnalyticsProviders() {
	}

	async sendMetrics(type: string, event: any) {
		let dataMap: { [key: string]: any; } = {
			'non_interaction': true
		};

		var augmentedSid = this.getAugmentedSid();
		var augmentedCidEid = this.getAugmentedCidEid(event);
		var augmentedUid = this.getAugmentedUid(event);
		let augmentedGroupId = this.getAugmentedGroupId(event);
		let augmentedOrdinal = this.getAugmentedOrdinal(event);

		dataMap['event_category'] = 'evolvids';
		dataMap['event_label'] = type + ':' + augmentedUid + ':' + augmentedSid;
		let evolvEvent = 'evolv-event';

		let groupActionString;
		if (augmentedOrdinal) {
			groupActionString = `${evolvEvent}:${augmentedGroupId}:${augmentedOrdinal}`;
			
			if (this.includeCidEid) {
				groupActionString += `:${augmentedCidEid}`;
			}

			let displayName = await this.getDisplayName(event);
			groupActionString += `:${encodeURIComponent(displayName)}`
		} else {
			groupActionString = `${evolvEvent}:${augmentedCidEid}`;
		}

		this.emit({
			event: evolvEvent,
			evolvEventDetails: {
				event_action: augmentedCidEid ? groupActionString :  evolvEvent,
				...dataMap
			}
		});
	}
}
