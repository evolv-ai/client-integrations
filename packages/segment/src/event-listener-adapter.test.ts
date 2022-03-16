import { SegmentEventListenerAdapter } from './event-listener-adapter';

describe('Segment Event Listener Adapter Test', () => {
    const event1: string = 'Test Event 1';
    const event2: string = 'Test Event 2';
    const event3: string = 'Test Event 3';

    const eventConfig: Record<string, string> = {
        [event1]: 'test-event-1',
        [event2]: 'test-event-2'
    };

    let eventMap: Record<string, (args: any) => void> = {};

    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['analytics'];
        eventMap = {};
    });

    describe('If event map is passed', () => {
        test('Validate only events from Segment are emitted to Evolv', () => {
            let emit = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                addEventListener: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                dispatchEvent: (event: string, params: any) => {
                    eventMap[event](params);
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            const client = new SegmentEventListenerAdapter(eventConfig);

            window['analytics'].dispatchEvent('track', { event: event1 });
            window['analytics'].dispatchEvent('track', { event: event2 });
            window['analytics'].dispatchEvent('track', { event: event3 });

            expect(emit.mock.calls.length).toBe(2);
            expect(emit.mock.calls[0]).toEqual([eventConfig[event1]]);
            expect(emit.mock.calls[1]).toEqual([eventConfig[event2]]);
        });
    });

    describe('If event map is empty', () => {
        test('Validate no events are emitted to Evolv', () => {
            let emit = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                addEventListener: jest.fn((event, cb) => {
                    eventMap[event] = cb;
                }),
                dispatchEvent: (event: string, params: any) => {
                    eventMap[event](params);
                }
            };

            window['evolv'] = {
                client: { emit }
            };

            const client = new SegmentEventListenerAdapter({});

            window['analytics'].dispatchEvent('track', { event: event1 });
            window['analytics'].dispatchEvent('track', { event: event2 });
            window['analytics'].dispatchEvent('track', { event: event3 });

            expect(emit.mock.calls.length).toBe(0);
        });
    });
});
