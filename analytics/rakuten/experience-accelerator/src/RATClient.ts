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
        var uid = this.getUid(event);
        let cidEid = this.getCidEid(event);

        this.sendRATEvent(uid, cidEid);
    }

    sendRATEvent(userId: string, cidEid: string) {
        var RAT_URL = 'https://rat.rakuten.co.jp';

        // RAT integration should resplit the eid and cid
        var cidEidArray = cidEid.split(':', 2);
        var cid = cidEidArray[0];
        var eid = cidEidArray[1];

        var data = {
          "acc": this.acc,
          "aid": this.aid,
          "etype": "async",
          "cp": {
              "userid": userId,
              "experimentid": eid,
              "candidateid": cid
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
