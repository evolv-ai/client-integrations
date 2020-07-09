/****
 * Evolv 1.0 Audience Filter code for Experience Accelerator
 * Note: this code is backwards compatible with the the Execution Plan
 * Note: the sample code below should be placed AFTER 
 * the execution plan/experience accelerator snippet in the DOM
 ****/

/****
 * Sample audience filter
 * Note: (await evolv.runtime) is not compatible with IE 11
 ****/
evolv.runtime.then(function(rt) {
    rt.updateAudience({
        [namespacedObject]: { // optional namespacing
            [key]: "[value]" //values are strings only
        }
    });
    // re-run evaluatePlans to apply filters to experiment
    rt.evaluatePlans();
});