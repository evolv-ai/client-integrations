import { GAClient } from "../GAClient";
import {GtagClient} from "../GtagClient";

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['ga'];
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

            const client = new GtagClient('sessionId', 'candidateId', 'userId');
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var ga = jest.fn();
            var on = jest.fn();
            window['ga'] = ga;

            const client = new GtagClient('sessionId', 'candidateId', 'userId');

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

            const client = new GAClient('trackingId', 'ns','sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(5);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid1:eid-eid1:extra:extra2"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
            expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", {
                "eventAction": "cid-cid1:eid-eid1:extra:extra2",
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

            const client = new GAClient('trackingId', 'ns','sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(10);

            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid1:eid-eid1"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
            expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", {
                "eventAction": "cid-cid1:eid-eid1",
                "eventCategory": "evolvids",
                "eventLabel": "confirmed:uid-user1:sid-sid1",
                "nonInteraction": true
            }]);

            expect(ga.mock.calls[5]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid2:eid-eid2"]);
            expect(ga.mock.calls[7]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
            expect(ga.mock.calls[8]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
            expect(ga.mock.calls[9]).toEqual( ["ns.send", "event", {
                "eventAction": "cid-cid2:eid-eid2",
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

            const client = new GAClient('trackingId', 'ns','sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(5);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid1:eid-eid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
                expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", {
                    "eventAction": "cid-cid1:eid-eid1",
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

            const client = new GAClient('trackingId', 'ns','sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('contaminated');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(10);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid1:eid-eid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
                expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", {
                    "eventAction": "cid-cid1:eid-eid1",
                    "eventCategory": "evolvids",
                    "eventLabel": "contaminated:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);

                expect(ga.mock.calls[5]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensioncandidateId", "cid-cid2:eid-eid2"]);
                expect(ga.mock.calls[7]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
                expect(ga.mock.calls[8]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
                expect(ga.mock.calls[9]).toEqual( ["ns.send", "event", {
                    "eventAction": "cid-cid2:eid-eid2",
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

            const client = new GAClient('trackingId', 'ns','sessionId', 'candidateId', 'userId');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(5);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", ""]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "uid-user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionsessionId", "sid-sid1"]);
                expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", {
                    "eventAction": "",
                    "eventCategory": "evolvids",
                    "eventLabel": "custom-event:uid-user1:sid-sid1",
                    "nonInteraction": true
                }]);
                done();
            },client.interval*2);
        });
    });
});
