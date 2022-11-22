import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class TagManagerAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000
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
		let ga4Config: boolean = false;

		if (!window.google_tag_manager) {
			console.log('Evolv: Google Tag Manager not detected.');
		}

		Object.keys(window.google_tag_manager).forEach((key) => {
			if (key.includes('G-')) {
				ga4Config = true;
			}
		});

		if (ga4Config)	console.log('Evolv: GA4 config not detected. Please ensure you have added a GA4 config tag to your GTM container.');
	};

	sendMetrics(type: string, event: any) {
		let dataMap: { [key: string]: any; } = {
			...event,
			type,
			// name: await this.getDisplayName(event.eid),
			'non_interaction': true
		};

		let evolvEvent = 'evolv';

		this.emit({
			event: evolvEvent,
			evolvEventDetails: { ...dataMap }
		});
	}
}
