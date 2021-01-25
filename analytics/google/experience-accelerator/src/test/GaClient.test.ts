import { GAClient } from "../GAClient";
import { GtagClient } from "../GtagClient";

let logSpy: any;

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['ga'];
        logSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
        logSpy.mockClear();
    });

    describe('Handle missing GA ', () => {
        test('Log message if GA is not found', (done) => {
            window['evolv'] = {
                client: {
                    on: jest.fn()
                }
            };

            const client = new GAClient('trackingId', 'ns', 0);

            setTimeout(() => {
                expect(logSpy.mock.calls.length).toBe(1);
                expect(logSpy.mock.calls[0][0]).toBe("Evolv: Analytics integration timed out - Couldn't find Analytics");
                done();
            }, client.interval);
        });

        test('Log message if GA is not found, but GTM is present', (done) => {
            window['evolv'] = {
                client: {
                    on: jest.fn()
                }
            };

            window['gtag'] = jest.fn();

            const client = new GAClient('trackingId', 'ns', 0);

            setTimeout(() => {
                expect(logSpy.mock.calls.length).toBe(2);
                expect(logSpy.mock.calls[0][0]).toBe("Evolv: Analytics integration timed out - Couldn't find Analytics");
                expect(logSpy.mock.calls[1][0]).toBe("Evolv: Analytics integration detected Google Tag Manager - please use 'Evolv.GtagClient()'");
                done();
            }, client.interval);
        });
    });

    describe('Ensure listeners set up', () => {
        test('Validate on listener configured when evolv ready before constructor', () => {
            var ga = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                client: {
                    on: on
                }
            };
            window['ga'] = ga;

            const client = new GtagClient();
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var ga = jest.fn();
            var on = jest.fn();
            window['ga'] = ga;

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

    describe('If GA already loaded', () => {
        test('Validate emitted events fire for a single experiment', () => {
            var ga = jest.fn();
            var on = jest.fn();
            window['ga'] = ga;
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
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2:eid2',
                                    eid: 'eid2'
                                }]
                            }
                        } else if (key === 'confirmations') {
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

            const client = new GAClient('trackingId', 'ns');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(2);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid1:eid-eid1:extra:extra2",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
        });

        test('Validate emitted events fire for multiple experiments', () => {
            var ga = jest.fn();
            window['ga'] = ga;
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
                        } else if (key === 'confirmations') {
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

            const client = new GAClient('trackingId', 'ns');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(4);

            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid1:eid-eid1",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);

            expect(ga.mock.calls[2]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid2:eid-eid2",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
        });
    });

    describe('If GA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var ga = jest.fn();
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
                        } else if (key === 'confirmations') {
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

            const client = new GAClient('trackingId', 'ns');
            client.sendMetricsForActiveCandidates('confirmed');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(2);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                    "eventAction": "evolv-event:cid-cid1:eid-eid1",
                    "eventCategory": "evolvids",
                    "eventLabel": "confirmed:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var ga = jest.fn();
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

            const client = new GAClient('trackingId', 'ns');
            client.sendMetricsForActiveCandidates('contaminated');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(4);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                    "eventAction": "evolv-event:cid-cid1:eid-eid1",
                    "eventCategory": "evolvids",
                    "eventLabel": "contaminated:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);

                expect(ga.mock.calls[2]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", {
                    "eventAction": "evolv-event:cid-cid2:eid-eid2",
                    "eventCategory": "evolvids",
                    "eventLabel": "contaminated:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once', done => {
            var ga = jest.fn();
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

            const client = new GAClient('trackingId', 'ns');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(2);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                    "eventAction": "evolv-event",
                    "eventCategory": "evolvids",
                    "eventLabel": "custom-event:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);
                done();
            },client.interval*2);
        });
    });

    describe('Ensure contaminations and confirmations only firing once per experiment', () => {
        test('Validate emitted events fire for multiple experiments', () => {
            var ga = jest.fn();
            window['ga'] = ga;
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
                        } else if (key === 'confirmations') {
                            return [{
                                cid: 'cid1:eid1'
                            }]
                        } else if (key === 'contaminations') {
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

            const client = new GAClient('trackingId', 'ns');
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
                } else if (key === 'confirmations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                } else if (key === 'contaminations') {
                    return [{
                        cid: 'cid1:eid1'
                    }, {
                        cid: 'cid2:eid2'
                    }]
                }
            };

            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            expect(ga.mock.calls.length).toBe(8);

            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid1:eid-eid1",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
            expect(ga.mock.calls[2]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid1:eid-eid1",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);

            expect(ga.mock.calls[4]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[5]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid2:eid-eid2",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);

            expect(ga.mock.calls[6]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[7]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:cid-cid2:eid-eid2",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
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

        test('Validate emitted events fire when ordinals present',() => {
            var ga = jest.fn();
            window['ga'] = ga;

            window['evolv'] = {
                context: context,
                client: {
                    on: on
                }
            };

            const client = new GAClient('trackingId', 'ns');
            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            expect(ga.mock.calls.length).toBe(4);

            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:gid-group1:ordinal-1",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
            expect(ga.mock.calls[2]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:gid-group2:ordinal-2",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
        });

        test('Validate emitted events fire when ordinals present - including the cid', () => {
            var ga = jest.fn();
            window['ga'] = ga;

            window['evolv'] = {
                context: context,
                client: {
                    on: on
                }
            };

            const client = new GAClient('trackingId', 'ns', 1000, true);
            client.sendMetricsForActiveCandidates('confirmed');
            client.sendMetricsForActiveCandidates('contaminated');

            expect(ga.mock.calls.length).toBe(4);

            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:gid-group1:ordinal-1:cid-cid1:eid-eid1",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
            expect(ga.mock.calls[2]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", {
                "eventAction": "evolv-event:gid-group2:ordinal-2:cid-cid2:eid-eid2",
                "eventCategory": "evolvids",
                "eventLabel": "contaminated:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);
        });
    });
});
