# Rakuten Analytics Experience Accelerator Integration

## To Build
```
npm install
npm run build
```

This will output:
dist/evolv-exp-acc-cs.js and dist/evolv-exp-acc-cs.min.js

These can be added directly to the page and used to configure the integration

```
// Copy the file contents
var EvolvContentSquare=function(e){"use strict";var t=function(){function e(e,t,n,i,r,o){var d=th...

// Configure the integration 
// with the parameters CSClient()

const client = new EvolvContentSquare.CSClient();
```
