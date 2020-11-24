# DataLayer Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exp-acc-dl.js and dist/evolv-exp-acc-dl.min.js

These can be added directly to the page and used to configure the integration.

DataLayer integration writes all active cids and eids to `evolv.context.cid` and `evolv.context.eid`

```
// Copy the file contents
var EvolvDL=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

const client = new EvolvDL.DLClient();
```
