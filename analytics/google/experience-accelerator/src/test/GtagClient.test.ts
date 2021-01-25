import { GtagClient } from "../GtagClient";

let logSpy: any;

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['gtag'];
        logSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
        logSpy.mockClear();
    });

    describe('Handle missing Google Tag Manager', () => {
        test('Log message if GTM is not found', (done) => {
            window['evolv'] = {
                client: {
                    on: jest.fn()
                }
            };

            const client = new GtagClient(0);

            setTimeout(() => {
                expect(logSpy.mock.calls.length).toBe(1);
                expect(logSpy.mock.calls[0][0]).toBe("Evolv: Analytics integration timed out - Couldn't find Analytics");
                logSpy.mockClear();
                done();
            }, client.interval);
        });

        test('Log message if GTM is not found, but GA is present', (done) => {
            window['evolv'] = {
                client: {
                    on: jest.fn()
                }
            };
            window['ga'] = jest.fn();

            const client = new GtagClient(0);

            setTimeout(() => {
                expect(logSpy.mock.calls.length).toBe(2);
                expect(logSpy.mock.calls[0][0]).toBe("Evolv: Analytics integration timed out - Couldn't find Analytics");
                expect(logSpy.mock.calls[1][0]).toBe("Evolv: Analytics integration detected GA - please use 'Evolv.GAClient()'");
                done();
            }, client.interval);
        });
    });

    describe('Ensure listeners set up', () => {
        test('Validate on listener configured when evolv ready before constructor', () => {
            var gtag = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                client: {
                    on: on
                }
            };
            window['gtag'] = gtag;

            const client = new GtagClient();
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var gtag = jest.fn();
            var on = jest.fn();
            window['gtag'] = gtag;

            const client = new GtagClient();

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

    describe('If GA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var gtag = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                context: {
                    sid: 'sid1',
                    get: function (key: string) {
                        if (key === 'experiments') {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1:eid1:extra',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2:eid2',
                                    eid: 'eid2'
                                }]
                            }
                        } else if (key === 'confirmations') {
                            return [{
                                cid: 'cid1:eid1:extra'
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new GtagClient();
            client.sendMetricsForActiveCandidates('confirmed');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-event:cid-cid1:eid-eid1:extra", {
                    "event_category": "evolvids",
                    "event_label": "confirmed:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var gtag = jest.fn();
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
                        } else if (key === 'contaminations') {
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

            const client = new GtagClient();
            client.sendMetricsForActiveCandidates('contaminated');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(2);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-event:cid-cid1:eid-eid1", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                expect(gtag.mock.calls[1]).toEqual( ["event", "evolv-event:cid-cid2:eid-eid2", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once', done => {
            var gtag = jest.fn();
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
                        } else if (key === 'contaminations') {
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

            const client = new GtagClient();
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-event", {
                    "event_category": "evolvids",
                    "event_label": "custom-event:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
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
                } else if (key === 'contaminations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                }
            }
        };

        test('Validate emitted events fire when ordinals present', done => {
            var gtag = jest.fn();

            window['evolv'] = {
                context: context,
                client: {
                    on: on
                }
            };

            const client = new GtagClient();
            client.sendMetricsForActiveCandidates('contaminated');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(2);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-event:gid-group1:ordinal-1", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                expect(gtag.mock.calls[1]).toEqual( ["event", "evolv-event:gid-group2:ordinal-2", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted events fire when ordinals present - including the cid', done => {
            var gtag = jest.fn();

            window['evolv'] = {
                context: context,
                client: {
                    on: on
                }
            };

            const client = new GtagClient(1000, true);
            client.sendMetricsForActiveCandidates('contaminated');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(2);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-event:gid-group1:ordinal-1:cid-cid1:eid-eid1", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                expect(gtag.mock.calls[1]).toEqual( ["event", "evolv-event:gid-group2:ordinal-2:cid-cid2:eid-eid2", {
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });
    });
});
