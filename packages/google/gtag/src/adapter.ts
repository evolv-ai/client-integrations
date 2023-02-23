import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class GtagAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000,
		public readonly includeCidEid = false
	) {
		super(maxWaitTime);
	}

	getAnalytics() {
		return window.gtag;
	}

	getHandler() {
		return this.getAnalytics();
	}

	checkAnalyticsProviders() {
		// @ts-ignore
		if ((window.GoogleAnalyticsObject && window[window.GoogleAnalyticsObject]) || window.ga) {
			console.log('Evolv: Analytics integration detected GA - please use \'Evolv.GAClient()\'');
		}
	}

	sendMetrics(type: string, event: any) {
		let dataMap: { [key: string]: any; } = {
			'non_interaction': true
		};

		var augmentedSid = this.getAugmentedSid();
		var augmentedCidEid = this.getAugmentedCidEid(event);
		var augmentedUid = this.getAugmentedUid(event);
		let augmentedGroupId = this.getAugmentedGroupId(event);
		let augmentedOrdinal = this.getAugmentedOrdinal(event);

		let evolvEvent = 'evolv-event';

		let groupActionString: string;
		if (augmentedOrdinal) {
			groupActionString = `${evolvEvent}:${augmentedGroupId}:${augmentedOrdinal}`;

			if (this.includeCidEid) {
				groupActionString += `:${augmentedCidEid}`;
			}
		} else {
			groupActionString = `${evolvEvent}:${augmentedCidEid}`;
		}


		dataMap['event_category'] = 'evolvids';

		this.getDisplayName(event).then((projectName: string) => {
			dataMap['event_label'] = type + ':' + augmentedUid + ':' + augmentedSid;

            if (projectName) {
                dataMap['event_label'] += ':' + projectName;
            }

			this.emit('event', augmentedCidEid ? groupActionString : evolvEvent, dataMap);
		})
	}
}
