# Heap Experience Accelerator Integration

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
var Heap = (function (exports) {...
```

Configure the integration using this structure for dimensions
```
maxWaitTime?: number;
```
If these are left blank then the default parameters will be used.

Example:
```
Heap.default({
});                  
```
