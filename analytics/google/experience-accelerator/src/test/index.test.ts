import { GAClient } from "../index";

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

            const client = new GAClient('trackingId', 'ns', 'candidateId', 'experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(5);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid1"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);
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

            const client = new GAClient('trackingId', 'ns', 'candidateId', 'experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(ga.mock.calls.length).toBe(10);
            expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid1"]);
            expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
            expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);

            expect(ga.mock.calls[5]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
            expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensioncandidateId", "cid2"]);
            expect(ga.mock.calls[7]).toEqual( ["ns.set", "dimensionexperimentId", "eid2"]);
            expect(ga.mock.calls[8]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
            expect(ga.mock.calls[9]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);
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

            const client = new GAClient('trackingId', 'ns', 'candidateId', 'experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(5);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);
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

            const client = new GAClient('trackingId', 'ns', 'candidateId', 'experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['ga'] = ga;

            setTimeout(() => {
                expect(ga.mock.calls.length).toBe(10);
                expect(ga.mock.calls[0]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[1]).toEqual( ["ns.set", "dimensioncandidateId", "cid1"]);
                expect(ga.mock.calls[2]).toEqual( ["ns.set", "dimensionexperimentId", "eid1"]);
                expect(ga.mock.calls[3]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[4]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);

                expect(ga.mock.calls[5]).toEqual( ["create", "trackingId", "auto", { "namespace": "ns" }]);
                expect(ga.mock.calls[6]).toEqual( ["ns.set", "dimensioncandidateId", "cid2"]);
                expect(ga.mock.calls[7]).toEqual( ["ns.set", "dimensionexperimentId", "eid2"]);
                expect(ga.mock.calls[8]).toEqual( ["ns.set", "dimensionuserId", "user1"]);
                expect(ga.mock.calls[9]).toEqual( ["ns.send", "event", "evolv", "evolv-confirmed", { "nonInteraction": true }]);
                done();
            },client.interval*2);
        });
    });
});
