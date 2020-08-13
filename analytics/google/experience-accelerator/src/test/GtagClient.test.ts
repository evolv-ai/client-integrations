import { GtagClient } from "../GtagClient";

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['gtag'];
    });

    describe('If GA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var gtag = jest.fn();
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

            const client = new GtagClient('trackingId', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-confirmed-cid1", {
                    "dimensionexperimentId": "eid1",
                    "dimensionuserId": "user1",
                    "non_interaction": true
                }]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var gtag = jest.fn();
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

            const client = new GtagClient('trackingId', 'userId', 'experimentId');
            client.sendMetricsForActiveCandidates('contaminated');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(2);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-contaminated-cid1", {
                    "dimensionexperimentId": "eid1",
                    "dimensionuserId": "user1",
                    "non_interaction": true
                }]);
                expect(gtag.mock.calls[1]).toEqual( ["event", "evolv-contaminated-cid2", {
                    "dimensionexperimentId": "eid2",
                    "dimensionuserId": "user1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once', done => {
            var gtag = jest.fn();
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

            const client = new GtagClient('trackingId', 'userId', 'experimentId');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-custom-event", {
                    "dimensionuserId": "user1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });

        test('Validate no experiment id if no dimension configured', done => {
            var gtag = jest.fn();
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

            const client = new GtagClient('trackingId', 'userId');
            client.sendMetrics('custom-event', {
                uid: 'user1',
                eid: 'exp1',
            });

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "evolv-custom-event", {
                    "dimensionuserId": "user1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });
    });
});
