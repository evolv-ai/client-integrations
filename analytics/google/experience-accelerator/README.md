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
// with the parameters GAClient(TRACKING_ID, NAMESPACE, WAIT TIME - OPTIONAL - DEFAULT 5000, INCLUDE CID EID - OPTIONAL - DEFAULT false)

const client = new Evolv.GAClient("UA-164633832-3", "", 5000, false);

OR

// with the parameters GtagClient(WAIT TIME - OPTIONAL - DEFAULT 5000, INCLUDE CID EID - OPTIONAL - DEFAULT false)
// note that Gtag implementation uses tracking ID configured on the site itself

const client = new Evolv.GtagClient();
```
