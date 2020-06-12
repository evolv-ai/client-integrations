class EvolvGAClient {
    trackingId: string;
    namespace: string;
    // experimentIdMetric: string;
    candidatedIdMetric: string;
    userIdMetric: string;
    maxWaitTime: number;

    constructor(
        trackingId: string,
        namespace: string,
        // experimentIdMetric: string,
        candidatedIdMetric: string,
        userIdMetric: string,
        maxWaitTime = 5000
    ) {
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
                rendered: (event: any) => {
                    addLogEntry('rendered', event);
                    this.sendMetrics(event);
                }
            }
        });
    }

    getGA(): Promise<any> {
        let ga: any;
        return new Promise((resolve, reject) => {
            let checkForGA = (startTime: number) => {
                // @ts-ignore
                ga = window['ga'];

                if (!ga) {
                    if (new Date().getTime() - startTime > this.maxWaitTime) {
                        reject('GA not found by Evolv');
                        return;
                    }
                    setTimeout(() => {
                        checkForGA(startTime);
                    }, 50);

                    return;
                }  else {
                    resolve(ga);
                }
            };

            checkForGA(new Date().getTime());
        });
    }

    private sendMetrics(event: any) {
        // @ts-ignore
        this.getGA().then((ga) => {
            let namespace = this.namespace;
            var prefix = namespace ? namespace + '.' : '';
            ga('create', this.trackingId, 'auto', namespace ? {namespace} : null);
            ga(prefix + 'set', 'dimension' + this.candidatedIdMetric, event.experimentId + '-' + event.candidateId);
            ga(prefix + 'set', 'dimension' + this.userIdMetric, event.experimentId + '-' + event.candidateId);
            ga(prefix + 'send', 'event', 'evolv', 'evolvRendered', { nonInteraction: true });
        });
    }
}

function merge(target: any, source: any) {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                merge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return target;
}

function isObject(value: any): value is { [key: string]: any } {
    return (value && typeof value === 'object' && !Array.isArray(value));
}

function addLogEntry(type: string, message: any) {
    message = (typeof message === 'string') ? message : JSON.stringify(message);
    console.info(type, message);
}
