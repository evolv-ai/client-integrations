/****
 * Evolv 1.0 Audience Filter code for Execution Plan.
 * Note: the sample code below should be placed AFTER 
 * the execution plan snippet in the DOM.
 ****/

/****
 * EXECUTION PLAN
 * Sample audience filter. 
 * Note: (await evolv.runtime) is not compatible with IE 11
 ****/
evolv.runtime.then(function(rt) {
    rt.updateAudience({
        // Namespace object will be included in event defintion in the Evolv Manager.
        // Please inform Evolv if you plan to use a namespace object.
        [namespacedObject]: {
            [key]: "[value]" //values are strings only
        }
    });
    // re-run evaluatePlans to apply filters to experiment
    rt.evaluatePlans();
});