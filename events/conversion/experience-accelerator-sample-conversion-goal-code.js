// Evolv 1.0 Experience Accelerator Conversion Integration Code

/****
 * Experience Accelerator click event. 
 * Reference the appropriate selector.
 ****/
var selector = document.querySelector("[selector]");
selector.addEventListener("click", function() {
    window.evolv.client.emit('[my-event]');
})

/****
 * Experience Accelerator trigger of conversion on page load event, e.g. order confirmation.
 ****/
document.addEventListener("DOMContentLoaded", function() {
    window.evolv.client.emit('[my-event]');
});
