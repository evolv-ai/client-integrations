function evolvGA(id, metrics, namespace) {
    var ga = window.ga;
    if (!ga) {
        console.error('NO GA!!');
        return;
    }
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
        // evolvPreload.addLogEntry('ga', e);
    });
}

// All listeners configured to log their arguments
// to the console except 'rendered', which triggers
// a GA event with Evolv data attached in custom
// dimensions. Remove any that the customer does
// not want firing.

window.evolvPreload = {
    listeners: {
        initialize: function(event) {
            addLogEntry('initialize', event);
        },

        initialized: function(event) {
            addLogEntry('initialized', event);
        },

        activated: function(event) {
            addLogEntry('activated', event);
        },

        reverted: function(event) {
            addLogEntry('reverted', event);
        },

        filtered: function(event) {
            addLogEntry('filtered', event);
        },

        selected: function(event) {
            addLogEntry('selected', event);
        },

        rendered: function(event) {
            addLogEntry('rendered', event);
            evolvLog(event);
        },

        notrendered: function(event) {
            addLogEntry('notrendered', event);
        },

        reconciled: function(event) {
            addLogEntry('reconciled', event);
        },

        stagecompleted: function(event) {
            addLogEntry('stagecompleted', event);
        },
    },
    addLogEntry
};

function addLogEntry(type, message) {
    message = (typeof message === 'string') ? message : JSON.stringify(message);
    console.log(type, message);
}
