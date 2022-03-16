import {EventListenerAdapter} from "./event-listener-adapter";
import {Analytics} from "./awaiter";

const event1 = "Test Event 1";
const event2 = "Test Event 2";

const interval1Multiplier = 3;
const interval2Multiplier = 2 * interval1Multiplier;

class ExampleEventListenerAdapter extends EventListenerAdapter {
    addListenersForEventData(): void {
        setTimeout(() => {
            this.emitEvent(event1);
        }, this.interval * interval1Multiplier);

        setTimeout(() => {
            this.emitEvent(event2);
        }, this.interval * interval2Multiplier);
    }

    checkAnalyticsProviders(): void {
    }

    getAnalytics(): Analytics {
        // @ts-ignore
        return window['example-analytics']
    }
}

function testAdapterContextUpdates(emit: any, client: any, done: any) {
    expect(emit.mock.calls.length).toBe(0);

    setTimeout(() => {
        expect(emit.mock.calls.length).toBe(1);
        expect(emit.mock.calls[0]).toEqual([event1]);
    }, client.interval * interval1Multiplier * 1.5);

    setTimeout(() => {
        expect(emit.mock.calls.length).toBe(2);
        expect(emit.mock.calls[1]).toEqual([event2]);
        done();
    }, client.interval * interval2Multiplier * 1.5);
}

describe('Event Listener Adapter Test', () => {
    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['example-analytics'];
    });

    afterEach(() => {
    });

    xdescribe('If Analytics and Evolv already loaded', () => {
        test('Validate events are sent', (done) => {
            let emit = jest.fn();

            // @ts-ignore
            window['example-analytics'] = jest.fn();
            window['evolv'] = {
                client: { emit }
            };

            const client = new ExampleEventListenerAdapter();

            setTimeout(() => {
                expect(emit.mock.calls.length).toBe(1);
                expect(emit.mock.calls[0]).toEqual([event1]);
                done();
            }, client.interval * interval1Multiplier * 1.5);

            setTimeout(() => {
                expect(emit.mock.calls.length).toBe(2);
                expect(emit.mock.calls[1]).toEqual([event2]);
                done();
            }, client.interval * interval2Multiplier * 1.5);
        });
    });

    describe('If Analytics already loaded', () => {
        test('Validate events are sent', (done) => {
            let emit = jest.fn();
            let analytics = jest.fn();

            window['evolv'] = {
                client: { emit }
            };

            const client = new ExampleEventListenerAdapter();

            // @ts-ignore
            window['example-analytics'] = analytics;

            testAdapterContextUpdates(emit, client, done);
        });
    });

    describe('If Evolv is already loaded', () => {
        test('Validate events are sent', (done) => {
            let emit = jest.fn();
            // @ts-ignore
            window['example-analytics'] = jest.fn();

            const client = new ExampleEventListenerAdapter();

            window['evolv'] = {
                client: {
                    emit
                }
            };

            testAdapterContextUpdates(emit, client, done);
        });
    });

    xdescribe('If neither are already loaded', () => {
        test('Validate events are sent', (done) => {
            let emit = jest.fn();

            const client = new ExampleEventListenerAdapter();

            window['evolv'] = {
                client: { emit }
            };

            // @ts-ignore
            window['example-analytics'] = jest.fn();

            testAdapterContextUpdates(emit, client, done);
        });
    });
});
