/****
 * Evolv 1.0 Audience Filter code for Experience Accelerator.
 * Note: the sample code below should be placed AFTER 
 * the experience accelerator snippet in the DOM.
 ****/

/****
 * EXPERIENCE ACCELERATOR
 * Sample audience filter.
 * Note: (await evolv.runtime) is not compatible with IE 11
 ****/
evolv.context.update({
    // Namespace object will be included in event defintion in the Evolv Manager.
    // Please inform Evolv if you plan to use a namespace object.
    [namespaceObj]: { // optional
        [key]: "[value]"
    }
});