import { Client } from "./Client";

export class AAClient extends Client {
    constructor(
        public readonly sessionIdDimension: string,
        public readonly userIdDimension: string,
        public readonly candidateIdDimension: string,
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
    }

    getAnalytics() {
        return (window.s && window.s.tl);
    }

    getHandler() {
        return this.customEventHandler || this.getAnalytics();
    }

    sendMetrics(type: string, event: any) {
        var augmentedSid = this.getAugmentedSid();
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);

        var y: any = {};

        y.linkTrackVars = this.userIdDimensionType + this.userIdDimension + ',' + this.sessionIdDimensionType + this.sessionIdDimension + ',' + this.candidateIdDimensionType + this.candidateIdDimension;

        y[this.candidateIdDimensionType + this.candidateIdDimension] = augmentedCidEid;
        y[this.userIdDimensionType + this.userIdDimension] = augmentedUid;
        y[this.sessionIdDimensionType + this.sessionIdDimension] =  augmentedSid;

        this.emit(this,'o', 'evolvids:' + type, y);
    }
}
