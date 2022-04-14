# Evolv Segment Integration

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

## Confirmation and Contamination events

When Evolv emits a confirmation or contamination event, a Segment `track` event will automatically be emitted in the following formats:

### Confirmation
```json
{
  "event": "Experiment Viewed",
  "properties": {
    "experimentId": "<Experiment Group ID>",
    "experimentName": "Evolv Experiment: <Evolv Group ID>",
    "variationId": "<Evolv Combination ID>",
    "variationName": "<Evolv Combination Name>"
  }
}
```

### Contamination
```json
{
  "event": "Experiment Contaminated",
  "properties": {
    "experimentId": "<Experiment Group ID>",
    "experimentName": "Evolv Experiment: <Evolv Group ID>",
    "variationId": "<Evolv Combination ID>",
    "variationName": "<Evolv Combination Name>"
  }
}
```

### Other events
All other events fired from Evolv will emitted as a Segment `track` event in the following format:

```json
{
  "event": "Evolv Event: <Evolv Event Name>"
}
```


## Using readable experiment names
*Note: this feature is __not recommended__ since it requires manually updating/adding experiment names.*

The `experimentNames` config parameter can be used to pass user-friendly/readable experiment names to be used in the `Experiment Viewed` and `Experiment Contaminated` events. You can pass an object containing a map of `group_id`s to `experimentName`s.

```json
{
  "eventListenerAdapter": {
    "parametersToReadFromSegment": {
      "Checkout Page Viewed": "checkout-page-viewed"
    },
    "experimentNames": {
      "450daa63-07a3-4859-8153-074fda34bb": "My Experiment Name",
      "444ada66-70b1-3453-6325-980fdb234a": "My Other Experiment Name"
    }
  }
}
```
