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

// Configure the integration using this structure for dimensions
//
// type Dimensions = "session" | "user" | "candidate" | "group" | "ordinal"
// type DimensionsValue = { key: string, type?: eVar (default) or prop };
// type DimensionsMap = { [dimension in Dimensions]?: DimensionsValue};

// Example AAClient(
//        dimensions: DimensionsMap      
//        maxWaitTime,
//        customEventHandler /* use this to handle emit events to Adobe yourself -- otherwise we use s.tl() */ )

const client = new Evolv.AAClient({
    user: { key: 1},
    sessions: { key: 2},
    candidate: { key: 3},
    group: { key: 4},
    ordinal: { key: 5}
});                     
```

If you wish to fire the information to Adobe yourself, implement the customerEventHandler.
The custom event handler should be in the form:

```
function(linkObject, linkType, linkName, overrideVariable) {
  // Implement code too notify Adobe Analytics
}
```
