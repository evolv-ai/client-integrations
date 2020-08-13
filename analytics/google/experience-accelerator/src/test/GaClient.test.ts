import { GAClient } from "../GAClient";

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['ga'];
    });

    describe('If GA already loaded', () => {
        test('Validate emitted events fire for a single experiment', () => {
            var ga = jest.fn();
            window['ga'] = ga;
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(4);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed-cid1", { "nonInteraction": true }]);
        });

        test('Validate emitted events fire for multiple experiments', () => {
            var ga = jest.fn();
            window['ga'] = ga;
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2',
                                    eid: 'eid2'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(8);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed-cid1", { "nonInteraction": true }]);

            expect(ga.mock.calls[4]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[5]).toEqual( ["ns.set", "dimensionexperimentId", "eid2"]);
            expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[7]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed-cid2", { "nonInteraction": true }]);
        });
    });

    describe('If GA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var ga = jest.fn();
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(4);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed-cid1", { "nonInteraction": true }]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var ga = jest.fn();
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2',
                                    eid: 'eid2'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('contaminated');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(8);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", "evolv", "evolv-contaminated-cid1", { "nonInteraction": true }]);

                expect(ga.mock.calls[4]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[5]).toEqual( ["ns.set", "dimensionexperimentId", "eid2"]);
                expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[7]).toEqual( ["ns.send", "event", "evolv", "evolv-contaminated-cid2", { "nonInteraction": true }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once', done => {
            var ga = jest.fn();
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2',
                                    eid: 'eid2'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId', 'experimentId');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(4);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionexperimentId", undefined]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.send", "event", "evolv", "evolv-custom-event", { "nonInteraction": true }]);
                done();
            },client.interval*2);
        });

        test('Validate no experiment id if no dimension configured', done => {
            var ga = jest.fn();
            window['evolv'] = {
                client: {
                    context: {
                        get: function () {
                            return {
                                allocations: [{
                                    uid: 'user1',
                                    cid: 'cid1',
                                    eid: 'eid1'
                                }, {
                                    uid: 'user1',
                                    cid: 'cid2',
                                    eid: 'eid2'
                                }]
                            }
                        }
                    }
                }
            };

            const client = new GAClient('trackingId', 'ns', 'userId');
            client.sendMetrics('custom-event', {
                uid: 'user1',
                eid: 'exp1',
            });

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(3);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.send", "event", "evolv", "evolv-custom-event", { "nonInteraction": true }]);
                done();
            },client.interval*2);
        });
    });
});
