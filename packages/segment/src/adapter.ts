import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class SegmentAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000
	) {
		super(maxWaitTime);
	}

	getAnalytics() {
		return window.analytics.track;
	}

	getHandler() {
		return this.getAnalytics();
	}

	checkAnalyticsProviders(): void {
		// No check requirements
	}

	sendMetrics(type: string, event: any) {
		console.error('sendMetrics:{type, event}', type, event)
		var augmentedSid = this.getAugmentedSid();
		var augmentedUid = this.getAugmentedUid(event);
		let augmentedGroupId = this.getAugmentedGroupId(event);
		let augmentedOrdinal = this.getAugmentedOrdinal(event);

		const ordinal = augmentedOrdinal ? {
			evolvOrdinal: augmentedOrdinal,
			evolvGroupId: augmentedGroupId
		} : {};

		this.emit(`Evolv Event: ${type}`, {
			eventType: type,
			evolvUid: augmentedUid,
			evolvSid: augmentedSid,
			...ordinal
		});
	}
}
