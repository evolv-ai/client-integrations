import {BaseAdapter} from "./adapter";

let logSpy: any;

class ExampleAdapter extends BaseAdapter {
    checkAnalyticsProviders(): void {
    }

    getAnalytics(): any {
        // @ts-ignore
        return window['example-analytics']
    }

    sendMetrics(type: string, event: any): void {
        this.emit([type, event])
    }
}

const firstCid = {
    "cid": "cid1:eid1",
    "eid": "eid1",
    "uid": "user1",
};

const secondCid = {
    "cid": "cid2:eid2",
    "eid": "eid2",
    "uid": "user1",
};

describe('Adapter Test', () => {
    beforeEach(() => {
        delete window['evolv'];
        // @ts-ignore
        delete window['example-analytics'];
        logSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
        logSpy.mockClear();
    });

    describe('Handle missing Analytics ', () => {
        test('Log message if Analytics is not found', (done) => {
            window['evolv'] = {
                client: {
                    on: jest.fn()
                }
            };

            const client = new ExampleAdapter(0);

            setTimeout(() => {
                expect(logSpy.mock.calls.length).toBe(1);
                expect(logSpy.mock.calls[0][0]).toBe("Evolv: Analytics integration timed out - Couldn't find Analytics");
                done();
            }, client.interval);
        });
    });

    describe('Ensure listeners set up', () => {
        test('Validate on listener configured when evolv ready before constructor', () => {
            var analytics = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                client: {
                    on: on
                }
            };
            // @ts-ignore
            window['example-analytics'] = analytics;

            const client = new ExampleAdapter();
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var analytics = jest.fn();
            var on = jest.fn();
            // @ts-ignore
            window['example-analytics'] = analytics;

            const client = new ExampleAdapter();

            window['evolv'] = {
                client: {
                    on: on
                }
            };

            setTimeout(() => {
                expect(on.mock.calls.length).toBe(3);
                expect(on.mock.calls[0][0]).toBe("confirmed");
                expect(on.mock.calls[1][0]).toBe("contaminated");
                expect(on.mock.calls[2][0]).toBe("event.emitted");
                done();
            }, client.interval*2);
        })
    });

    describe('If Analytics already loaded', () => {
        test('Validate emitted events fire for a single experiment', () => {
            var analytics = jest.fn();
            var on = jest.fn();
            // @ts-ignore
            window['example-analytics'] = analytics;
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1:eid1:extra:extra2',
                                    eid: 'eid1'
                                }, secondCid]
                            }
                        } else if (key === 'experiments.confirmations') {
                            return [{
                                cid: 'cid1:eid1:extra:extra2'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('confirmed');

            expect(analytics.mock.calls.length).toBe(1);
            expect(analytics.mock.calls[0]).toEqual( [["confirmed", {
                "cid": "cid1:eid1:extra:extra2",
                "eid": "eid1",
                "uid": "user1"
            }]]);
        });

        test('Validate emitted events fire for multiple experiments', () => {
            var analytics = jest.fn();
            // @ts-ignore
            window['example-analytics'] = analytics;
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [firstCid, secondCid]
                            }
                        } else if (key === 'experiments.confirmations') {
                            return [{
                                cid: 'cid1:eid1'
                            }, {
                                cid: 'cid2:eid2'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('confirmed');

            expect(analytics.mock.calls.length).toBe(2);

            expect(analytics.mock.calls[0]).toEqual( [["confirmed", firstCid]]);
            expect(analytics.mock.calls[1]).toEqual( [["confirmed", secondCid]]);
        });
    });

    describe('If Analytics loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var analytics = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [firstCid, secondCid]
                            }
                        } else if (key === 'experiments.confirmations') {
                            return [{
                                cid: 'cid1:eid1'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('confirmed');

            // @ts-ignore
            window['example-analytics'] = analytics;

            setTimeout(() => {
                expect(analytics.mock.calls.length).toBe(1);
                expect(analytics.mock.calls[0]).toEqual( [['confirmed', firstCid]]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var analytics = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [firstCid, secondCid]
                            }
                        } else if (key === 'experiments.contaminations') {
                            return [{
                                cid: 'cid1:eid1'
                            }, {
                                cid: 'cid2:eid2'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('contaminated');

            // @ts-ignore
            window['example-analytics'] = analytics;

            setTimeout(() => {
                expect(analytics.mock.calls.length).toBe(2);

                expect(analytics.mock.calls[0]).toEqual( [["contaminated", firstCid]]);
                expect(analytics.mock.calls[1]).toEqual( [["contaminated", secondCid]]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once', done => {
            var analytics = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [firstCid, secondCid]
                            }
                        } else if (key === 'experiments.contaminations') {
                            return [{
                                cid: 'cid1:eid1'
                            }, {
                                cid: 'cid2:eid2'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            // @ts-ignore
            window['example-analytics'] = analytics;

            setTimeout(() => {
                expect(analytics.mock.calls.length).toBe(1);
                expect(analytics.mock.calls[0]).toEqual( [["custom-event", {
                    "uid": "user1",
                }]]);
                done();
            },client.interval*2);
        });
    });

    describe('Ensure contaminations and confirmations only firing once per experiment', () => {
        test('Validate emitted events fire for multiple experiments', () => {
            var analytics = jest.fn();
            // @ts-ignore
            window['example-analytics'] = analytics;
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1:eid1',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2:eid2',
                                    eid: 'eid2'
                                }]
                            }
                        } else if (key === 'experiments.confirmations') {
                            return [{
                                cid: 'cid1:eid1'
                            }]
                        } else if (key === 'experiments.contaminations') {
                            return [{
                                cid: 'cid1:eid1'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            window['evolv'].context.get = (key: string) => {
                if (key === 'experiments') {
                    return {
                        allocations: [{
                            uid: 'user1',
                            cid: 'cid1:eid1',
                            eid: 'eid1'
                        }, {
                            uid: 'user1',
                            cid: 'cid2:eid2',
                            eid: 'eid2'
                        }]
                    }
                } else if (key === 'experiments.confirmations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                } else if (key === 'experiments.contaminations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                }
            };

            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            expect(analytics.mock.calls.length).toBe(4);

            expect(analytics.mock.calls[0]).toEqual( [["confirmed", firstCid]]);

            expect(analytics.mock.calls[1]).toEqual( [["contaminated", firstCid]]);

            expect(analytics.mock.calls[2]).toEqual( [["confirmed", secondCid]]);

            expect(analytics.mock.calls[3]).toEqual( [["contaminated", secondCid]]);
        });
    });

    describe('Ordinals present', () => {
        var on = jest.fn();
        let context = {
            sid: 'sid1',
            get: function (key: string) {
                if (key === 'experiments') {
                    return {
                        allocations: [{
                            uid: 'user1',
                            cid: 'cid1:eid1',
                            eid: 'eid1',
                            ordinal: 1,
                            group_id: 'group1'
                        }, {
                            uid: 'user1',
                            cid: 'cid2:eid2',
                            eid: 'eid2',
                            ordinal : 2,
                            group_id: 'group2'
                        }]
                    }
                } else if (key === 'experiments.contaminations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                }
            }
        };

        test('Validate emitted events fire when ordinals present',() => {
            var analytics = jest.fn();
            // @ts-ignore
            window['example-analytics'] = analytics;

            window['evolv'] = {
                context: context,
                client: {
                    on: on
                }
            };

            const client = new ExampleAdapter();
            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            expect(analytics.mock.calls.length).toBe(2);

            expect(analytics.mock.calls[0]).toEqual( [["contaminated", {
                "cid": "cid1:eid1",
                "eid": "eid1",
                "group_id": "group1",
                "ordinal": 1,
                "uid": "user1",
            }]]);
            expect(analytics.mock.calls[1]).toEqual( [["contaminated", {
                "cid": "cid2:eid2",
                "eid": "eid2",
                "group_id": "group2",
                "ordinal": 2,
                "uid": "user1",
            }]]);
        });
    });
});
