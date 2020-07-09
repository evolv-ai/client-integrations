// Evolv 1.0 Conversion

/****
 * Sample conversion method
 ****/
function evolvConversion() {
    evolv.runtime.then(function(runtime) {
        runtime.emitEvent('[event-name]');
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