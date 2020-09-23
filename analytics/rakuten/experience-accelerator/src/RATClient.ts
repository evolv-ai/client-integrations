import { Client } from "./Client";

export class RATClient extends Client {
    constructor(
        public readonly acc: number,
        public readonly aid: number,
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    sendMetrics(type: string, event: any) {
        var augmentedUid = this.getAugmentedUid(event);
        let augmentedCidEid = this.getAugmentedCidEid(event);
        let augmentedSid = this.getAugmentedSid();

        this.sendRATEvent(augmentedUid, augmentedCidEid, augmentedSid);
    }

    sendRATEvent(userId: string, eidCid: string, sessionId: string) {
        var RAT_URL = 'https://rat.rakuten.co.jp';

        var data = {
          "acc": this.acc,
          "aid": this.aid,
          "etype": "async",
          "cp": {
              "userid": userId,
              "candidateid": eidCid,
              "sessionid": sessionId
          }
        };
        try {
          fetch(RAT_URL, {
              method: 'POST',
              body: 'cpkg_none=' + JSON.stringify(data),
              headers: {}
          });
        } catch (error) {
          console.error('Error:', error);
        }  
      }
}
