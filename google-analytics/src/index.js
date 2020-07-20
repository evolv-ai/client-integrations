var EvolvGAClient = /** @class */ (function () {
    function EvolvGAClient(trackingId, namespace, 
    // experimentIdMetric: string,
    candidatedIdMetric, userIdMetric, maxWaitTime) {
        var _this = this;
        if (maxWaitTime === void 0) { maxWaitTime = 5000; }
        this.trackingId = trackingId;
        this.namespace = namespace;
        // this.experimentIdMetric = experimentIdMetric;
        this.candidatedIdMetric = candidatedIdMetric;
        this.userIdMetric = userIdMetric;
        this.maxWaitTime = maxWaitTime;
        // @ts-ignore
        window['evolvPreload'] = window['evolvPreload'] || {};
        // @ts-ignore
        window['evolvPreload'] = merge(window['evolvPreload'], {
            listeners: {
                rendered: function (event) {
                    addLogEntry('rendered', event);
                    _this.sendMetrics(event);
                }
            }
        });
    }
    EvolvGAClient.prototype.getGA = function () {
        var _this = this;
        var ga;
        return new Promise(function (resolve, reject) {
            var checkForGA = function (startTime) {
                // @ts-ignore
                ga = window['ga'];
                if (!ga) {
                    if (new Date().getTime() - startTime > _this.maxWaitTime) {
                        reject('GA not found by Evolv');
                        return;
                    }
                    setTimeout(function () {
                        checkForGA(startTime);
                    }, 50);
                    return;
                }
                else {
                    resolve(ga);
                }
            };
            checkForGA(new Date().getTime());
        });
    };
    EvolvGAClient.prototype.sendMetrics = function (event) {
        var _this = this;
        // @ts-ignore
        this.getGA().then(function (ga) {
            var namespace = _this.namespace;
            var prefix = namespace ? namespace + '.' : '';
            ga('create', _this.trackingId, 'auto', namespace ? { namespace: namespace } : null);
            ga(prefix + 'set', 'dimension' + _this.candidatedIdMetric, event.experimentId + '-' + event.candidateId);
            ga(prefix + 'set', 'dimension' + _this.userIdMetric, event.experimentId + '-' + event.candidateId);
            ga(prefix + 'send', 'event', 'evolv', 'evolvRendered', { nonInteraction: true });
        });
    };
    return EvolvGAClient;
}());
function merge(target, source) {
    var _a, _b;
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, (_a = {}, _a[key] = {}, _a));
                }
                merge(target[key], source[key]);
            }
            else {
                Object.assign(target, (_b = {}, _b[key] = source[key], _b));
            }
        }
    }
    return target;
}
function isObject(value) {
    return (value && typeof value === 'object' && !Array.isArray(value));
}
function addLogEntry(type, message) {
    message = (typeof message === 'string') ? message : JSON.stringify(message);
    console.info(type, message);
}
