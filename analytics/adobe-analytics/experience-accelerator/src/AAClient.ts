import { Client } from "./Client";
type Dimensions = "session" | "user" | "candidate" | "group" | "ordinal"
type DimensionsValue = { key: string, type?: string };
type DimensionsMap = { [dimension in Dimensions]?: DimensionsValue};

export class AAClient extends Client {
    constructor(
        public readonly dimensions: DimensionsMap,
        public readonly maxWaitTime = 5000,
        public readonly customEventHandler?: () => {}
    ) {
        super(maxWaitTime);

        this.validateDimension('session');
        this.validateDimension('user');
        this.validateDimension('candidate');
        this.validateDimension('group');
        this.validateDimension('ordinal');
    }

    validateDimension(name: Dimensions) {
        // @ts-ignore
        if (this.dimensions[name] && this.dimensions[name].type && this.dimensions[name].type !== 'eVar' && this.dimensions[name].type !== 'prop') {
            throw new Error(`${name}:Dimension types must be "eVar" or "prop"`);
        }

        // @ts-ignore
        if (this.dimensions[name] && !this.dimensions[name].key) {
            throw new Error(`${name}: Dimension key must be defined`);
        }
    }

    getAnalytics() {
        return (window.s && window.s.tl);
    }

    getHandler() {
        return this.customEventHandler || this.getAnalytics();
    }

    getDimensionForAdobe(dimension: DimensionsValue) {
        return (dimension.type || 'eVar') + dimension.key;
    }

    sendMetrics(type: string, event: any) {
        var augmentedSid = this.getAugmentedSid();
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);
        let augmentedGroupId = this.getAugmentedGroupId(event);
        let augmentedOrdinal = this.getAugmentedOrdinal(event);

        var y: any = {};

        y.linkTrackVars = Object.values(this.dimensions).map((value: DimensionsValue | undefined) => {
            return value && this.getDimensionForAdobe(value);
        }).join(',');

        if (this.dimensions.candidate) {
            y[this.getDimensionForAdobe(this.dimensions.candidate)] = augmentedCidEid;
        }

        if (this.dimensions.user) {
            y[this.getDimensionForAdobe(this.dimensions.user)] = augmentedUid;
        }

        if (this.dimensions.session) {
            y[this.getDimensionForAdobe(this.dimensions.session)] = augmentedSid;
        }

        if (this.dimensions.group) {
            y[this.getDimensionForAdobe(this.dimensions.group)] = augmentedGroupId;
        }

        if (this.dimensions.ordinal) {
            y[this.getDimensionForAdobe(this.dimensions.ordinal)] = augmentedOrdinal;
        }

        this.emit(this,'o', 'evolvids:' + type, y);
    }
}
