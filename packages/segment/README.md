## Evolv Segment Integration

## Usage
When using the Segment integration, a map of Segment events to listen for and their respective Evolv events should be passed into the config in `parametersToReadFromSegment`.

The example config below will listen for the Segment events `Button Clicked` and `Page View`, and emit `evolv-button-clicked` and `evolv-page-load` to Evolv, respectively.

```json
{
  "eventListenerAdapter": {
    "parametersToReadFromSegment": {
      "Button Clicked": "evolv-button-clicked",
      "Page View": "evolv-page-load"
    }
  }
}
```

*Note:* Only events that are defined in `parametersToReadFromSegment` will be caught and forwarded to Evolv.

## Advanced Event Mapping

To map more complex events, consider a checkout page with 3 different steps. Each step has the same event name from Segment, so they can't be mapped 1:1, but we can match properties in the `track` call to map each of the steps:

```js
// track call for first step:
analytics.track("Checkout Page Viewed", { step: 1 });

// track call for second step:
analytics.track("Checkout Page Viewed", { step: 2 });

// track call on third step:
analytics.track("Checkout Page Viewed", { step: 3 });
```

We can map all 3 steps as separate events in our config by passing the Segment event name as the key, and an array of objects as it's value. The objects in the array contain 2 keys: `condition` and `event`.

The value of `condition` is an object containing key/value pairs we want to match in the `properties` passed into the `track` call.

The value of `event` is a string containing the corresponding Evolv event to map to.

Example:

```json
{
  "eventListenerAdapter": {
    "parametersToReadFromSegment": {
      "Checkout Page Viewed": [{
        "condition": {
          "step": 1
        },
        "event": "checkout-page-viewed-step-1"
      },{
        "condition": {
          "step": 2
        },
        "event": "checkout-page-viewed-step-2"
      },{
        "condition": {
          "step": 3
        },
        "event": "checkout-page-viewed-step-3"
      }]
    }
  }
}
```
