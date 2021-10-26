# Adobe Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/index.js (commonjs format), dist/index.mjs (esm format), and dist/index.browser.js (iife format for testing in the browser)

index.browser.js used to test the integration

```
// Copy the file contents
var AdobeAnalytics=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration using this structure for dimensions
//
// type Dimensions = "user" | "candidate" | "group" | "ordinal"
// type DimensionsValue = { key: string, type?: eVar (default) or prop };
// type DimensionsMap = { [dimension in Dimensions]?: DimensionsValue};

// Example AdobeAnalytics.integration(
//        dimensions: DimensionsMap      
//        maxWaitTime: Integer,
//        customEventHandler /* use this to handle emit events to Adobe yourself -- otherwise we use s.tl() */ )

const client = AdobeAnalytics.integration(
    dimensions: {
        user: { key: 1},
        candidate: { key: 2},
        group: { key: 3},
        ordinal: { key: 4}
    }
);                     
```

If you wish to fire the information to Adobe yourself, implement the customerEventHandler.
The custom event handler should be in the form:

```
function(linkObject, linkType, linkName, overrideVariable) {
  // Implement code too notify Adobe Analytics
}
```
