import { QuantumDataLayerAdapter } from "./data-layer-adapter";

describe('Verify the constructor has completed before firing the listeners', () => {
    it('should have completed the constructor before firing the listeners', (done) => {
        const CART_VALUE = 40;
        window.QuantumMetricAPI = {
            getCartValue: () => CART_VALUE ,
            addEventListener: (event: string, callback: (data: Record<string, unknown>) => void) => {}
        };
        window['evolv'] = {
            context: {
                update: (data: Record<string, any>) => {
                    expect(data.quantumMetric.cartValue).toEqual(CART_VALUE);
                    done();
                }
            }
        };

        new QuantumDataLayerAdapter();
    });
});