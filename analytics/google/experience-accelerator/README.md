# Google Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exp-acc-ga.js and dist/evolv-exp-acc-ga.min.js

These can be added directly to the page and used to configure the integration

```
// Copy the file contents
var Evolv=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration 
// with the parameters GAClient(TRACKING_ID, NAMESPACE, SESSION_ID_DIMENSION, CANDIDATE_ID_DIMENSION, USER_ID_SESSION)

const client = new Evolv.GAClient("UA-164633832-3", "");

OR

// with the parameters GAClient(SESSION_ID_DIMENSION, CANDIDATE_ID_DIMENSION, USER_ID_SESSION)
// note that Gtag implementation uses tracking ID configured on the site itself

const client = new Evolv.GtagClient();
```
