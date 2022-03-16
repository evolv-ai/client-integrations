import {Awaiter} from "./awaiter";

export abstract class EventListenerAdapter extends Awaiter {
    evolvReady = false;
    eventsToEmitWhenEvolvReady: string[] = [];

    constructor(public readonly maxWaitTime = 5000) {
        super(maxWaitTime);

        this.waitForAnalytics();
        this.waitForEvolv();
    }

    onAnalyticsFound() {
        this.addListenersForEventData();
    };

    onEvolvFound() {
        this.evolvReady = true;

        if (this.eventsToEmitWhenEvolvReady.length) {
            this.applyEventData(this.eventsToEmitWhenEvolvReady);
            this.eventsToEmitWhenEvolvReady = [];
        }
    };

    emitEvent(event: string) {
        if (!this.evolvReady) {
            this.eventsToEmitWhenEvolvReady.push(event);
        } else {
            this.getEvolv().client.emit(event);
        }
    }

    applyEventData(events: string[]) {
        events.forEach(event => {
            this.getEvolv().client.emit(event);
        });
    }

    abstract addListenersForEventData(): void;
}
