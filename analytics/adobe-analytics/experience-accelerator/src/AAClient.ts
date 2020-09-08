import { Client } from "./Client";

export class AAClient extends Client {
    constructor(
        public readonly sessionIdDimension: string,
        public readonly userIdDimension: string,
        public readonly candidateIdDimension: string,
        public readonly eventsConfig: {[key: string]: string;},
        public readonly sessionIdDimensionType = 'eVar',
        public readonly userIdDimensionType = 'eVar',
        public readonly candidateIdDimensionType = 'eVar',
        public readonly maxWaitTime = 5000,
        public readonly customEventHandler?: () => {}
    ) {
        super(maxWaitTime);

        if (!(sessionIdDimensionType === 'eVar' || sessionIdDimensionType === 'prop')
            || !(candidateIdDimensionType === 'eVar' || candidateIdDimensionType === 'prop')
            || !(userIdDimensionType === 'eVar' || userIdDimensionType === 'prop')) {
            throw new Error('Dimension types must be "eVar" or "prop"')
        }
        if (!eventsConfig['confirmed']) {
            throw new Error('eventsConfig.confirmed mapping required')
        }
        if (!eventsConfig['contaminated']) {
            console.warn('evolv: eventsConfig.contaminated mapping not defined. This is a recommended setting')
        }
    }

    getAnalytics() {
        return (window.s && window.s.tl);
    }


    getHandler() {
        return this.customEventHandler || this.getAnalytics();
    }

    getEventIds(evolvEvent?: string): string {
        if (evolvEvent) {
            return this.eventsConfig[evolvEvent];
        }

        return Object.values(this.eventsConfig).join(',');
    }

    sendMetrics(type: string, event: any) {
        let eventName = this.getEventIds(type);
        if (!eventName) {
            console.info('evolv: analytics integration not configured for event: ' + type);
            return;
        }

        var augmentedSid = this.getAugmentedSid();
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);
        let augmentedType = 'evolvids:' + (augmentedCidEid? augmentedCidEid + ':' : '') + type + ':' + augmentedUid + ':' + augmentedSid;

        var y: any = {};

        y.linkTrackVars = this.userIdDimensionType + this.userIdDimension + ',' + this.sessionIdDimensionType + this.sessionIdDimension + ',' + this.candidateIdDimensionType + this.candidateIdDimension + ',events';

        y.linkTrackEvents = this.getEventIds();
        y.events = this.getEventIds(type);

        y[this.candidateIdDimensionType + this.candidateIdDimension] = augmentedCidEid;
        y[this.userIdDimensionType + this.userIdDimension] = augmentedUid;
        y[this.sessionIdDimensionType + this.sessionIdDimension] = augmentedSid;

        this.emit(this,'o', augmentedType, y);
    }
}
