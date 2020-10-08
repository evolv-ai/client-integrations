# Rakuten Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exp-acc-rat.js and dist/evolv-exp-acc-rat.min.js

These can be added directly to the page and used to configure the integration

```
// Copy the file contents
var Evolv=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration 
// with the parameters RATClient(ACC, AID)

const client = new Evolv.RATClient(9999, 2);
```
