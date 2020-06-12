function _evolvGA(id, metrics, namespace) {
    var prefix = namespace ? namespace + '.' : '';
    try {
        ga('create', id, 'auto', namespace ? { namespace } : null);
        for (const dimension in metrics) {
            ga(prefix + 'set', 'dimension'+dimension, metrics[dimension]);
        }
        ga(prefix + 'send', 'event', 'evolv', 'evolvRendered', { nonInteraction: true });
    } catch (e) {
        console.error(e.toString());
    }
}

function evolvGA(id, metrics, namespace) {
    var interval = setInterval( function() {
        if (window.ga) {
            _evolvGA(id, metrics, namespace);
            clearInterval(interval);
        }
    }, 100);

    setTimeout(function() {
        if (window.ga) {
            console.error('GA not found in 10s after page load');
            return;
        }
        clearInterval(interval);
    }, 10000)
}

// TODO: create initialize method where stuff gets pulled in, allowing us to make an npm module to include
function evolvLog(e) {
    evolv.runtime.then(function(runtime) {
        var evolvUID = runtime.audience.cookie['evolv:uid']
        var evolvCID = e.planId.split(':')[0];
        var evolvEID = e.planId.split(':')[1];
        console.log(evolvUID, evolvCID, evolvEID);

        // Uncomment one of the following for GA and replace values
        // with your own

        // GA with no namespace
        //
        // evolvGA('UA-XXXXXXXXX-Y', {'A': evolvEID, 'B': evolvCID, 'C': evolvUID});

        // Pass namespace in if configured
        //
        // evolvGA('UA-XXXXXXXXX-Y', {'A': evolvEID, 'B': evolvCID, 'C': evolvUID}, 'NAMESPACE');

        // Uncomment to see confirmation of the GA call in the console
        //
        // evolvPreload.logEvent('ga', e);
    });
}

// Don't blow away existing preload
if (!window.evolvPreload) {
    window.evolvPreload = {};
}

// Don't blow away pre-installed listeners
if (!window.evolvPreload.listeners) {
    window.evolvPreload.listeners = {};
}

// Only add rendered / notrendered, users can add more hooks
// if they would like to. (https://media.evolv.ai/releases/latest/docs/pages/lifecycle.html)

function logEvent(type, message) {
    message = (typeof message === 'string') ? message : JSON.stringify(message);
    console.log(type, message);
}

function renderedHook(event) {
    logEvent('rendered', event);
    evolvLog(event);
}

function notRenderedHook(event) {
    logEvent('notrendered', event);
}

window.evolvPreload.listeners.rendered = renderedHook;
window.evolvPreload.listeners.notrendered = renderedHook;
window.evolvPreload.logEvent = logEvent;
