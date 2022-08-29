# Quantum Metric Experience Accelerator Integration

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
var QuantumMetric = (function (exports) {...
```

Configure the integration using this structure for dimensions
```
dataAdapter?: {
    listenersParameters?: Record<string, string>,
    parametersToReadFromQuantum?: Record<string, boolean>,
},
maxWaitTime?: number;
```
If these are left blank then the default parameters will be used.

Example:
```
QuantumMetric.default({
    dataAdapter: {
        listenersParameters: {
            '-2': 'rageClick',
            '-5': 'possibleFrustration',
            '-7': 'slowApiCall',
            '-9': 'frustratedSlowNavigation',
            '-19': 'frozenUI',
            '-22': 'longRunningSpinner'
        },
        parametersToReadFromQuantum: {
            cartValue: true
        }
    }
});                  
```

**Required Steps with Quantum Metric**
Evolv's integration can only write our events to a global object on the window -- ```window.evolvQuantumDataLayer```

Quantum Metric need to configure their system to pick up values set here and pass them back.
