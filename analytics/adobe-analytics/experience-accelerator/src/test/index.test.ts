import { AAClient } from "../AAClient";

describe('AA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['s'];
    });

    describe('If AA already loaded', () => {
        test('Validate emitted events fire for a single experiment', () => {
            var tl = jest.fn();
            window['s'] = { tl: tl };
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

            const client = new AAClient('experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(tl.mock.calls.length).toBe(1);
            expect(tl.mock.calls[0]).toEqual( [client, "o", "evolv-confirmed-cid1", {
                "eVarexperimentId": "user1",
                "eVaruserId": "eid1",
                "events": "evolv-confirmed-cid1",
                "linkTrackEvents": "events",
                "linkTrackVars": "eVarexperimentId,eVaruserId,events"
            }]);
        });

        test('Validate emitted events fire for multiple experiments', () => {
            var tl = jest.fn();
            window['s'] = { tl: tl };
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

            const client = new AAClient('experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            expect(tl.mock.calls.length).toBe(2);
            expect(tl.mock.calls[0]).toEqual( [client, "o", "evolv-confirmed-cid1", {
                "eVarexperimentId": "user1",
                "eVaruserId": "eid1",
                "events": "evolv-confirmed-cid1",
                "linkTrackEvents": "events",
                "linkTrackVars": "eVarexperimentId,eVaruserId,events"
            }]);

            expect(tl.mock.calls[1]).toEqual( [client, "o", "evolv-confirmed-cid2", {
                "eVarexperimentId": "user1",
                "eVaruserId": "eid2",
                "events": "evolv-confirmed-cid2",
                "linkTrackEvents": "events",
                "linkTrackVars": "eVarexperimentId,eVaruserId,events"
            }]);
        });
    });

    describe('If AA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var tl = jest.fn();

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

            const client = new AAClient('experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(1);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolv-confirmed-cid1", {
                    "eVarexperimentId": "user1",
                    "eVaruserId": "eid1",
                    "events": "evolv-confirmed-cid1",
                    "linkTrackEvents": "events",
                    "linkTrackVars": "eVarexperimentId,eVaruserId,events"
                }]);
                done();
            }, 100);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var tl = jest.fn();
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

            const client = new AAClient('experimentId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(2);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolv-confirmed-cid1", {
                    "eVarexperimentId": "user1",
                    "eVaruserId": "eid1",
                    "events": "evolv-confirmed-cid1",
                    "linkTrackEvents": "events",
                    "linkTrackVars": "eVarexperimentId,eVaruserId,events"
                }]);
                expect(tl.mock.calls[1]).toEqual( [client, "o", "evolv-confirmed-cid2", {
                    "eVarexperimentId": "user1",
                    "eVaruserId": "eid2",
                    "events": "evolv-confirmed-cid2",
                    "linkTrackEvents": "events",
                    "linkTrackVars": "eVarexperimentId,eVaruserId,events"
                }]);
                done();
            },100);
        });
    });
});
