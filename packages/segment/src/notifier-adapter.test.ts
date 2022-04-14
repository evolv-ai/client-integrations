import { SegmentNotifierAdapter } from './notifier-adapter';

describe('Segment Notifier Adapter Test', () => {
    const experimentNames: Record<string, any> = {
            'group-id-1': 'My Experiment'
    };

    let eventMap: Record<string, (args: any, props?: any) => void> = {};

    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['analytics'];
        eventMap = {};
    });

    describe('If experimentNames is not passed', () => {
        test('Experiment name will fallback', () => {
            let track = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                track
            };

            window['evolv'] = {
                client: {
                    emit: jest.fn(),
                    on: jest.fn()
                },
            };

            const client = new SegmentNotifierAdapter({}, {});

            client.sendMetrics('confirmed', {
                group_id: 'group-id-1',
                ordinal: 2,
                eid: 123,
                cid: 321
            });

            expect(track.mock.calls.length).toBe(1);
            expect(track.mock.calls[0]).toEqual([
                "Experiment Viewed", {
                    "experiment_id": 123,
                    "experiment_name": "Experiment: Evolv Optimization group-id-1",
                    "nonInteraction": 1,
                    "variation_id": 321,
                    "variation_name": "Combination 2",
                }
            ]);
        });
    });


    describe('If experimentNames passed', () => {
        test('Experiment name will be used', () => {
            let track = jest.fn();

            // @ts-ignore
            window['analytics'] = {
                track
            };

            window['evolv'] = {
                client: {
                    emit: jest.fn(),
                    on: jest.fn()
                },
            };

            const client = new SegmentNotifierAdapter({}, experimentNames);

            client.sendMetrics('confirmed', {
                group_id: 'group-id-1',
                ordinal: 2,
                eid: 123,
                cid: 321
            });

            expect(track.mock.calls.length).toBe(1);
            expect(track.mock.calls[0]).toEqual([
                "Experiment Viewed", {
                    "experiment_id": 123,
                    "experiment_name": "My Experiment",
                    "nonInteraction": 1,
                    "variation_id": 321,
                    "variation_name": "Combination 2",
                }
            ]);
        });
    });
});
