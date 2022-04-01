import { SegmentEventListenerAdapter } from './event-listener-adapter';

describe('Segment Event Listener Adapter Test', () => {
    const event1: string = 'Test Event 1';
    const event2: string = 'Test Event 2';
    const event3: string = 'Test Event 3';

    const eventConfig: Record<string, any> = {
        [event1]: 'test-event-1',
        [event2]: 'test-event-2'
    };

    const eventConfig2: Record<string, any> = {
        [event1]: 'test-event-1',
        [event2]: [{
            condition: { step_name: 'shipping', step: 1 },
            event: 'test-event-0'
        }, {
            condition: { step_name: 'billing', step: 2 },
            event: 'test-event-2'
        }, {
            condition: { step_name: 'review', step: 3 },
            event: 'test-event-0'
        }]
    };

    let eventMap: Record<string, (args: any, props?: any) => void> = {};

    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['analytics'];
        delete window['dataLayer'];
        eventMap = {};
    });

    describe('If event map is passed', () => {
        test('Validate only events from Segment are emitted to Evolv', () => {
            let emit = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                ready: jest.fn(cb => cb()),
                on: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                emit: (event: string, params: any, properties: any) => {
                    eventMap[event](params, properties || {});
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            window['dataLayer'] = [];

            const client = new SegmentEventListenerAdapter(eventConfig);

            window['analytics'].emit('track', event1);
            window['analytics'].emit('track', event2);
            window['analytics'].emit('track', event3);

            expect(emit.mock.calls.length).toBe(2);
            expect(emit.mock.calls[0]).toEqual([eventConfig[event1]]);
            expect(emit.mock.calls[1]).toEqual([eventConfig[event2]]);
        });
    });

    describe('If event is present in dataLayer', () => {
        test('Emit events to Evolv', (done) => {
            let emit = jest.fn();

            window['dataLayer'] = [{
                segmentAnonymousId: 1,
                event: event1
            }, {
                segmentAnonymousId: 1,
                event: event2,
                step_name: 'billing',
                step: 2
            }];

            const client = new SegmentEventListenerAdapter(eventConfig2);

            // @ts-ignore
            window['analytics'] = {
                ready: jest.fn(cb => cb()),
                on: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                emit: (event: string, params: any, properties: any) => {
                    eventMap[event](params, properties || {});
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            setTimeout(() => {
                expect(emit.mock.calls.length).toBe(2);
                expect(emit.mock.calls[0]).toEqual([eventConfig2[event1]]);
                expect(emit.mock.calls[1]).toEqual([eventConfig2[event2][1].event]);
                done();
            }, 100);
        });
    });

    describe('If conditional events are passed', () => {
        test('Validate only events from Segment are emitted to Evolv', () => {
            let emit = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                ready: jest.fn(cb => cb()),
                on: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                emit: (event: string, params: any, properties: any) => {
                    eventMap[event](params, properties || {});
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            window['dataLayer'] = [];

            const client = new SegmentEventListenerAdapter(eventConfig2);

            window['analytics'].emit('track', event1);
            window['analytics'].emit('track', event2, { step_name: 'billing', step: 2 });
            window['analytics'].emit('track', event3);

            expect(emit.mock.calls.length).toBe(2);
            expect(emit.mock.calls[0]).toEqual([eventConfig2[event1]]);
            expect(emit.mock.calls[1]).toEqual([eventConfig2[event2][1].event]);
        });
    });

    describe('If event map is empty', () => {
        test('Validate no events are emitted to Evolv', () => {
            let emit = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                ready: jest.fn(cb => cb()),
                on: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                emit: (event: string, params: any) => {
                    eventMap[event](params);
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            window['dataLayer'] = [];

            const client = new SegmentEventListenerAdapter({});

            window['analytics'].emit('track', event1);
            window['analytics'].emit('track', event2);
            window['analytics'].emit('track', event3);

            expect(emit.mock.calls.length).toBe(0);
        });
    });
});
