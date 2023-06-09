import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class TagManagerAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000,
		public readonly dataLayerName = 'dataLayer'
	) {
		super(maxWaitTime);
	}

	getAnalytics() {
		// @ts-ignore
		return window.google_tag_manager && window[this.dataLayerName] && window[this.dataLayerName].findIndex(i => i.event === 'gtm.load') > -1;
	}

	getHandler() {
		// @ts-ignore
		return window[this.dataLayerName].push;
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

		if (!ga4Config)	console.log('Evolv: GA4 config not detected. Please ensure you have added a GA4 config tag to your GTM container.');
	};

	sendMetrics(type: string, event: any) {
		this.getDisplayName(event).then((projectName: string) => {
			let dataMap: { [key: string]: any; } = {
				...event,
				type,
				'non_interaction': true
			};

			if (projectName) {
				dataMap.projectName = projectName;
			}

			const eventProperties = ['group_id', 'eid', 'cid', 'ordinal', 'excluded', 'type'];

			eventProperties.forEach((property) => {
				if (!(property in dataMap)) {
					dataMap[property] = undefined;
				}
			});

			let evolvEvent = 'evolv';

			window.evolv.context.set('ga_sending', true);
			window.evolv.context.set('ga_handler_ready', !!this.getHandler());

			this.emit({
				event: evolvEvent,
				evolvEventDetails: { ...dataMap }
			});
		});
	}
}
