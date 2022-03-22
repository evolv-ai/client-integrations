## Evolv Segment Integration

## Usage
When using the Segment integration, a map of Segment events to listen for and their respective Evolv events should be passed into the config in `parametersToReadFromSegment`.

The example config below will listen for the Segment events `Button Clicked` and `Page View`, and emit `evolv-button-clicked` and `evolv-page-load` to Evolv, respectively.

```
{
  eventListenerAdapter: {
    parametersToReadFromSegment: {
      "Button Clicked": "evolv-button-clicked",
      "Page View": "evolv-page-load"
    }
  }
}
```

*Note:* Only events that are defined in `parametersToReadFromSegment` will be caught and forwarded to Evolv.