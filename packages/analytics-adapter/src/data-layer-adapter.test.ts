import {DataLayerAdapter} from "./data-layer-adapter";
import {Analytics} from "./awaiter";

const synchronousContext = {
    example: {
        complex: 'item',
        with: {
            many: 'layers',
            andTypes: 3
        }
    },
    example2: true
};

const asynchronousContext1 = {
    more: 'complex',
    data: {
        'like': 'this'
    },
    example: {
        makeSureWeDeepMerge: true
    }
};

const asynchronousContext2 = {
    example: {
        makeSureWeDeepMerge2: true
    }
};

const interval1Multiplier = 3;
const interval2Multiplier = 2 * interval1Multiplier;

class ExampleDataLayerAdapter extends DataLayerAdapter {
    addListenersForContextData(): void {
        setTimeout(() => {

            this.setOnContext(asynchronousContext1)
        }, this.interval * interval1Multiplier);

        setTimeout(() => {
            this.setOnContext(asynchronousContext2)
        }, this.interval * interval2Multiplier);
    }

    getAnalyticsContextData(): { [key:string]: any } {
        return synchronousContext;
    }

    checkAnalyticsProviders(): void {
    }

    getAnalytics(): Analytics {
        // @ts-ignore
        return window['example-analytics']
    }
}

class ExampleDelayedDataLayerAdapter extends ExampleDataLayerAdapter {
    initialized = false;

    isInitilizated() {
        return this.initialized;
    }
}

function testAdapterContextUpdates(update: any, client: any, done: any) {
    expect(update.mock.calls.length).toBe(0);

    setTimeout(() => {
        expect(update.mock.calls.length).toBe(1);
        expect(update.mock.calls[0]).toEqual([synchronousContext]);
    }, client.interval * 1.5);


    setTimeout(() => {
        expect(update.mock.calls.length).toBe(2);
        expect(update.mock.calls[1]).toEqual([asynchronousContext1]);
    }, client.interval * interval1Multiplier * 1.5);

    setTimeout(() => {
        expect(update.mock.calls.length).toBe(3);
        expect(update.mock.calls[2]).toEqual([asynchronousContext2]);
        done();
    }, client.interval * interval2Multiplier * 1.5);
}

describe('Data Layer Adapter Test', () => {
    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['example-analytics'];
    });

    afterEach(() => {
    });

    test('Ensure first interval to be less than the second', () => {
        expect(interval1Multiplier).toBeLessThan(interval2Multiplier)
    });

    describe('If Analytics and Evolv already loaded', () => {
        test('Validate context set', (done) => {
            let update = jest.fn();

            // @ts-ignore
            window['example-analytics'] = jest.fn();
            window['evolv'] = {
                context: {
                    update: update
                }
            };

            const client = new ExampleDataLayerAdapter();

            expect(update.mock.calls.length).toBe(1);
            expect(update.mock.calls[0]).toEqual([synchronousContext]);

            setTimeout(() => {
                expect(update.mock.calls.length).toBe(2);
                expect(update.mock.calls[1]).toEqual([asynchronousContext1]);
            }, client.interval * interval1Multiplier * 1.5);

            setTimeout(() => {
                expect(update.mock.calls.length).toBe(3);
                expect(update.mock.calls[2]).toEqual([asynchronousContext2]);
                done();
            }, client.interval * interval2Multiplier * 1.5);
        });
    });

    describe('If Analytics already loaded', () => {
        test('Validate context set', (done) => {
            let update = jest.fn();
            let analytics = jest.fn();

            window['evolv'] = {
                context: {
                    update: update
                }
            };

            const client = new ExampleDataLayerAdapter();

            // @ts-ignore
            window['example-analytics'] = analytics;

            testAdapterContextUpdates(update, client, done);
        });
    });

    describe('If Evolv is already loaded', () => {
        test('Validate context set', (done) => {
            let update = jest.fn();
            // @ts-ignore
            window['example-analytics'] = jest.fn();

            const client = new ExampleDataLayerAdapter();

            window['evolv'] = {
                context: {
                    update: update
                }
            };

            testAdapterContextUpdates(update, client, done);
        });
    });

    describe('If neither are already loaded', () => {
        test('Validate context set', (done) => {
            let update = jest.fn();

            const client = new ExampleDataLayerAdapter();

            window['evolv'] = {
                context: {
                    update: update
                }
            };

            // @ts-ignore
            window['example-analytics'] = jest.fn();

            testAdapterContextUpdates(update, client, done);
        });
    });

    describe('If neither are already loaded and delayed initilization is used', () => {
        test('Validate context not set if initialized returns false', (done) => {
            let update = jest.fn();

            const client = new ExampleDelayedDataLayerAdapter();

            window['evolv'] = {
                context: {
                    update: update
                }
            };

            // @ts-ignore
            window['example-analytics'] = jest.fn();

            setTimeout(() => {
                expect(update.mock.calls.length).toBe(0);
                done();
            }, client.interval * 1.5);
        });

        test('Validate context set if initialized returns true', (done) => {
            let update = jest.fn();

            const client = new ExampleDelayedDataLayerAdapter();

            window['evolv'] = {
                context: {
                    update: update
                }
            };

            // @ts-ignore
            window['example-analytics'] = jest.fn();

            client.initialized = true;
            testAdapterContextUpdates(update, client, done);
        });
    });
});
