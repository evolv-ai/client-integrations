# Google Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exec-plan-ga.js and dist.evolv-exec-plan-ga.min.js

These can be added directly to the page and used to configure the integration

```
// Copy the file contents
var Evolv=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration 
// with the parameters GAClient(TRACKING_ID, NAMESPACE, USER_ID_METRIC, EXPERIMENT_ID_METRIC (optional))
const client = new Evolv.GAClient("UA-164633832-3", "", "1", "2");
```
