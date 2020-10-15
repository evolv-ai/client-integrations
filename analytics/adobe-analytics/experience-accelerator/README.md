# Adobe Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exp-acc-aa.js and dist/evolv-exp-acc-aa.min.js

These can be added directly to the page and used to configure the integration

```
// Copy the file contents
var Evolv=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration 
with the parameters AAClient( 
        sessionIdDimension: string,
        userIdDimension
        candidateIdDimension,
        eventsConfig /* { evolv-event-name: 'adobe-event-name'} - 'confirmed' (required), 'contaminated', other custom events fired to evolv
        sessionIdDimensionType /* default 'eVar' - values 'eVar' or 'prop'*/,
        userIdDimensionType /* default 'eVar' - values 'eVar' or 'prop'*/,
        candidateIdDimensionType /* default 'eVar' - values 'eVar' or 'prop'*/,
        maxWaitTime,
        customEventHandler /* use this to handle emit events to Adobe yourself -- otherwise we use s.tl() */ )
const client = new Evolv.AAClient('1', '2', '3', { 'confirmed': 'event1', 'contaminated': 'event2', 'checkout': 'event3' });                     
```

If you wish to fire the information to Adobe yourself, implement the customerEventHandler.
The custom event handler should be in the form:

```
function(linkObject, linkType, linkName, overrideVariable) {
  // Implement code too notify Adobe Analytics
}
```
