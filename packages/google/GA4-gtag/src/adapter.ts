import { AnalyticsNotifierAdapter } from '@evolv-integrations/analytics-adapter';

export class GtagAdapter extends AnalyticsNotifierAdapter {
	constructor(
		public readonly maxWaitTime = 5000
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
			...event,
			type, 
			// name: await this.getDisplayName(event.eid),
			'non_interaction': true
		};

		let evolvEvent = 'evolv';

		this.emit('event', evolvEvent, dataMap);
	}
}
