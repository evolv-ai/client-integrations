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

            const client = new AAClient('sessionId', 'userId', 'candidateId');
            expect(on.mock.calls.length).toBe(3);
            expect(on.mock.calls[0][0]).toBe("confirmed");
            expect(on.mock.calls[1][0]).toBe("contaminated");
            expect(on.mock.calls[2][0]).toBe("event.emitted");
        });

        test('Validate on listener configured when evolv ready after constructor', (done) => {
            var tl = jest.fn();
            var on = jest.fn();
            window['s'] = { tl: tl };

            const client = new AAClient('sessionId', 'userId', 'candidateId');

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
                const client = new AAClient('sessionId', 'userId', 'candidateId');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong session dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId', 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong user dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId'
                    , 'eVar', 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate errors with wrong user dimension type', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId'
                    , 'eVar', 'eVar', 'wrong');
                expect(1).toBe(2); // Should not get here - should error
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(true);
        });

        test('Validate no errors with correct config - eVar', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId'
                    , 'eVar', 'eVar', 'eVar');
            } catch(err) {
                errored = true;
            }

            expect(errored).toBe(false);
        });

        test('Validate no errors with correct config - prop', () => {
            let errored = false;
            try {
                const client = new AAClient('sessionId', 'userId', 'candidateId'
                    , 'prop', 'prop', 'prop');
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

            const client = new AAClient('sessionId', 'userId', 'candidateId'
                , 'prop', 'prop', 'prop',
                5000, custom);
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = {tl: tl};

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(0);
                expect(custom.mock.calls.length).toBe(1);
                expect(custom.mock.calls[0]).toEqual([client, "o", "evolvids:contaminated", {
                    "propsessionId": "sid-sid1",
                    "propuserId": "uid-user1",
                    "propcandidateId": "cid-cid1:eid-eid1",
                    "linkTrackVars": "propuserId,propsessionId,propcandidateId"
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

            const client = new AAClient('sessionId', 'userId', 'candidateId');
            client.sendMetricsForActiveCandidates('confirmed');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(1);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:confirmed", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1:extra",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
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

            const client = new AAClient('sessionId', 'userId', 'candidateId');
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(2);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:contaminated", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
                }]);
                expect(tl.mock.calls[1]).toEqual( [client, "o", "evolvids:contaminated", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid2:eid-eid2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
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

            const client = new AAClient('sessionId', 'userId', 'candidateId');
            client.sendMetrics('custom-event', {
                uid: 'user1'
            });

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(1);
                expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:custom-event", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
                }]);
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

            const client = new AAClient('sessionId', 'userId', 'candidateId'
                , 'eVar', 'eVar', 'eVar',
                5000, custom);
            client.sendMetricsForActiveCandidates('contaminated');

            window['s'] = { tl: tl };

            setTimeout(() => {
                expect(tl.mock.calls.length).toBe(0);
                expect(custom.mock.calls.length).toBe(2);
                expect(custom.mock.calls[0]).toEqual( [client, "o", "evolvids:contaminated", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid1:eid-eid1",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
                }]);
                expect(custom.mock.calls[1]).toEqual( [client, "o", "evolvids:contaminated", {
                    "eVarsessionId": "sid-sid1",
                    "eVaruserId": "uid-user1",
                    "eVarcandidateId": "cid-cid2:eid-eid2",
                    "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
                }]);
                done();
            },client.interval*2);
        });
    });

    describe('Ensure contaminations and confirmations only firing once per experiment', () => {
        test('Validate emitted events fire for multiple experiments', () => {
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

            window['s'] = { tl: tl };

            const client = new AAClient('sessionId', 'userId', 'candidateId');
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

            expect(tl.mock.calls.length).toBe(4);
            expect(tl.mock.calls[0]).toEqual( [client, "o", "evolvids:confirmed", {
                "eVarsessionId": "sid-sid1",
                "eVaruserId": "uid-user1",
                "eVarcandidateId": "cid-cid1:eid-eid1",
                "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
            }]);
            expect(tl.mock.calls[1]).toEqual( [client, "o", "evolvids:contaminated", {
                "eVarsessionId": "sid-sid1",
                "eVaruserId": "uid-user1",
                "eVarcandidateId": "cid-cid1:eid-eid1",
                "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
            }]);
            expect(tl.mock.calls[2]).toEqual( [client, "o", "evolvids:confirmed", {
                "eVarsessionId": "sid-sid1",
                "eVaruserId": "uid-user1",
                "eVarcandidateId": "cid-cid2:eid-eid2",
                "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
            }]);
            expect(tl.mock.calls[3]).toEqual( [client, "o", "evolvids:contaminated", {
                "eVarsessionId": "sid-sid1",
                "eVaruserId": "uid-user1",
                "eVarcandidateId": "cid-cid2:eid-eid2",
                "linkTrackVars": "eVaruserId,eVarsessionId,eVarcandidateId"
            }]);
        });
    });
});
