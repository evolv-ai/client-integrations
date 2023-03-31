import { DataLayerAdapter } from '@evolv-integrations/analytics-adapter';

const AVAILABLE_PARAMETERS_TO_READ = {
    GET_CART_VALUE: 'cartValue'
};

export class QuantumDataLayerAdapter extends DataLayerAdapter {
    initialized = false;

    constructor(
        public listenersParameters: Record<string, string> = {},
        public parametersToReadFromQuantum: Record<string, boolean> = {},
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);

        const defaultParametersToReadFromQuantum: Record<string, boolean> = {};
        defaultParametersToReadFromQuantum[AVAILABLE_PARAMETERS_TO_READ.GET_CART_VALUE] = true;

        const defaultListenerParams = {
            '-2': 'rageClick',
            '-5': 'possibleFrustration',
            '-7': 'slowApiCall',
            '-9': 'frustratedSlowNavigation',
            '-19': 'frozenUI',
            '-22': 'longRunningSpinner'
        };

        this.listenersParameters = { ...defaultListenerParams, ...listenersParameters };
        this.parametersToReadFromQuantum = { ...defaultParametersToReadFromQuantum, ...parametersToReadFromQuantum };

        this.initialized = true;
    }

    getAnalytics() {
        // @ts-ignore
        return window.QuantumMetricAPI;
    }

    checkAnalyticsProviders(): void {
        // No check requirements
    }

    addListenersForContextData(): void {
        for (const [key, value] of Object.entries(this.listenersParameters)) {
            this.getAnalytics().addEventListener(parseInt(key), (evt: any) => {
                let quantumMetric: Record<string, number> = {};

                let currentValue = this.getEvolv().context.get(`quantumMetric.${value}`);
                quantumMetric[value] = currentValue? ++currentValue : 1;
                this.getEvolv().context.update({
                    quantumMetric: quantumMetric
                });
            });
        }
    }

    getAnalyticsContextData(): Record<string, any> {
        let quantumMetric: Record<string, any> = {};

        if (this.parametersToReadFromQuantum[AVAILABLE_PARAMETERS_TO_READ.GET_CART_VALUE]) {
            quantumMetric[AVAILABLE_PARAMETERS_TO_READ.GET_CART_VALUE] = this.getAnalytics().getCartValue()
        }

        return {
            quantumMetric: quantumMetric
        };
    }

    isInitilizated(): boolean {
        return this.initialized;
    }
}
