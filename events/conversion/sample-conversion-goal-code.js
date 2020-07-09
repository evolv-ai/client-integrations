// Evolv 1.0 Conversion

/****
 * Sample conversion method
 ****/
function evolvConversion() {
    // Note: (await evolv.runtime) is not compatible with IE 11
    evolv.runtime.then(function(rt) {
        rt.emitEvent('[event-name]'); // event name is set in the Manager
    });
};

/****
 * Selector click event. 
 * Reference the appropriate selector.
 ****/
var selector = document.querySelector("#cta");
selector.addEventListener("click", function() {
    evolvConversion();
})

/****
 * Trigger conversion on page load event. 
 ****/
document.addEventListener("DOMContentLoaded", function() {
    evolvConversion();
});