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

            // Google Analytics - replace values
            evolvGA('UA-164633832-1', {'1': evolvEID, '2': evolvCID, '3': evolvUID});

            evolvPreload.addLogEntry('ga', e);
        });
    }

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

let num = 1;

function addLogEntry(type, message) {
    message = (typeof message === 'string') ? message : JSON.stringify(message);

    const tbody = document.querySelector('#logOutput');
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="row">${num}</th>
        <td>
            <time>${new Date().toISOString()}</time>
        </td>
        <td>${type}</td>
        <td><pre>${message}</pre></td>
    `;

    tbody.appendChild(row);

    num += 1;

	console.log(type, message);
}
