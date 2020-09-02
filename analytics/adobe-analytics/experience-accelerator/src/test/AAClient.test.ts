import { AAClient } from "../AAClient";

describe('AA integration', () => {
    beforeEach(() => {
        delete window['evolv'];
        delete window['s'];
    });

    describe('Ensure listeners set up', () => {
        test('Validate on listener configured when evolv ready before constructor', () => {
            var tl = jest.fn();
            var on = jest.fn();
            window['evolv'] = {
                client: {
                    on: on
                }
            };
            window['s'] = { tl: tl };

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1', 'contaminated': 'event2' });
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var tl = jest.fn();
            var on = jest.fn();
            window['s'] = { tl: tl };

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1', 'contaminated': 'event2' });

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

    describe('Config tests', () => {
        test('Validate errors with no confirmmed event configured', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId', {});
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong session dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId',
                    {'confirmed': 'event1'}, 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong user dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId',
                    {'confirmed': 'event1'}, 'eVar', 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong user dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId',
                    {'confirmed': 'event1'}, 'eVar', 'eVar', 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate no errors with correct config - eVar', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId',
                    {'confirmed': 'event1'}, 'eVar', 'eVar', 'eVar');
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(false);
        });

        test('Validate no errors with correct config - prop', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId',
                    {'confirmed': 'event1'}, 'prop', 'prop', 'prop');
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(false);
        });

        test('Validate prop emitted', done => {
            var tl = jest.fn();
            var custom = jest.fn();
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
                            }]
                        }
                    }
                },
                client: {
                    on: on
                }
            };

            const client = new AAClient('sessionId', 'userId', 'candidateId',
                {'confirmed': 'event1', 'contaminated': 'event2'}, 'prop', 'prop', 'prop',
                5000, custom);
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = {tl: tl};

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(0);
                expect(custom.mock.calls.length).toBe(1);
                expect(custom.mock.calls[0]).toEqual([client, "o", "evolvids:cid-cid1:eid-eid1:contaminated:uid-user1:sid-sid1", {
                    "propsessionId": "sid-sid1",
                    "propuserId": "uid-user1",
                    "propcandidateId": "cid-cid1:eid-eid1",
                    "events": "event2",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "propuserId,propsessionId,propcandidateId,events"
                }]);
                done();
            }, client.interval * 2);
        });
    });

    describe('If AA loads after events', () => {
        test('Validate emitted events fire for a single experiment', done => {
            var tl = jest.fn();
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

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1', 'contaminated': 'event2' });
            client.sendMetricsForActiveCandidates('confirmed');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(1);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:cid-cid1:eid-eid1:extra:confirmed:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1:extra",
                    "events": "event1",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                done();
            }, client.interval*2);
        });

        test('Validate emitted events fire for multiple experiments', done => {
            var tl = jest.fn();
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

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1', 'contaminated': 'event2' });
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(2);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:cid-cid1:eid-eid1:contaminated:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1",
                    "events": "event2",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                expect(tl.mock.calls[1]).toEqual( [client, "o", "evolvids:cid-cid2:eid-eid2:contaminated:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid2:eid-eid2",
                    "events": "event2",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                done();
            },client.interval*2);
        });

        test('Validate emitted non-experiment events fire once - if configured', done => {
            var tl = jest.fn();
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

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1', 'contaminated': 'event2', 'custom-event': 'event3' });
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(1);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:custom-event:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "",
                    "events": "event3",
                    "linkTrackEvents": "event1,event2,event3",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                done();
            },client.interval*2);
        });

        test('Validate no emitted events - if not configured', done => {
            var tl = jest.fn();
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

            const client = new AAClient('sessionId', 'userId', 'candidateId', { 'confirmed': 'event1' });
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(0);
                done();
            },client.interval*2);
        });
    });

    describe('custom handler', () => {
        test('Validate emitted events fire for multiple experiments', done => {
            var tl = jest.fn();
            var custom = jest.fn();
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

            const client = new AAClient('sessionId', 'userId', 'candidateId',
                { 'confirmed': 'event1', 'contaminated': 'event2' }, 'eVar', 'eVar', 'eVar',
                5000, custom);
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(0);
                expect(custom.mock.calls.length).toBe(2);
                expect(custom.mock.calls[0]).toEqual( [client, "o", "evolvids:cid-cid1:eid-eid1:contaminated:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1",
                    "events": "event2",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                expect(custom.mock.calls[1]).toEqual( [client, "o", "evolvids:cid-cid2:eid-eid2:contaminated:uid-user1:sid-sid1", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid2:eid-eid2",
                    "events": "event2",
                    "linkTrackEvents": "event1,event2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId,events"
                }]);
                done();
            },client.interval*2);
        });
    });
});
