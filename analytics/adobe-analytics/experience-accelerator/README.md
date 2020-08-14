# Google Analytics Experience Accelerator Integration

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
// with the parameters AAClient(TRACKING_ID, NAMESPACE, CANDIDATE_ID_METRIC, EXPERIMENT_ID_METRIC, USER_ID_METRIC)
const client = new Evolv.AAClient("UA-164633832-3", "1", "2");
```
