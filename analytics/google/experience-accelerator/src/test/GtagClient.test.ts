import { GtagClient } from "../GtagClient";

describe('GA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['gtag'];
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

            const client = new GtagClient('sessionId', 'candidateId', 'userId');
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var gtag = jest.fn();
            var on = jest.fn();
            window['gtag'] = gtag;

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

            const client = new GtagClient('sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "cid-cid1:eid-eid1:extra", {
                    "dimensioncandidateId": "cid-cid1:eid-eid1:extra",
                    "dimensionsessionId": "sid-sid1",
                    "dimensionuserId": "uid-user1",
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

            const client = new GtagClient('sessionId', 'candidateId', 'userId');
            client.sendMetricsForActiveCandidates('contaminated');

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(2);
                expect(gtag.mock.calls[0]).toEqual( ["event", "cid-cid1:eid-eid1", {
                    "dimensioncandidateId": "cid-cid1:eid-eid1",
                    "dimensionsessionId": "sid-sid1",
                    "dimensionuserId": "uid-user1",
                    "event_category": "evolvids",
                    "event_label": "contaminated:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                expect(gtag.mock.calls[1]).toEqual( ["event", "cid-cid2:eid-eid2", {
                    "dimensioncandidateId": "cid-cid2:eid-eid2",
                    "dimensionsessionId": "sid-sid1",
                    "dimensionuserId": "uid-user1",
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

            const client = new GtagClient('sessionId', 'candidateId', 'userId');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['gtag'] = gtag;

            setTimeout(() => {
                expect(gtag.mock.calls.length).toBe(1);
                expect(gtag.mock.calls[0]).toEqual( ["event", "", {
                    "dimensionsessionId": "sid-sid1",
                    "dimensionuserId": "uid-user1",
                    "event_category": "evolvids",
                    "event_label": "custom-event:uid-user1:sid-sid1",
                    "non_interaction": true
                }]);
                done();
            },client.interval*2);
        });
    });
});
