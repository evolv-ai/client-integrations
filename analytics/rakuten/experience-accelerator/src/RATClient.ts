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
        let sid = this.getSid();

        this.sendRATEvent(uid, sid, cidEid);
    }

    sendRATEvent(userId: string, sessionId:string, cidEid: string) {
        var RAT_URL = 'https://rat.rakuten.co.jp';

        // CS integration should resplit the eid and cid
        var cidEidArray = cidEid.split(':');

        // Make the whole thing the CID as you might have a third
        // field for cloned candidates
        var cid = cidEidArray.join(':');
        var eid = cidEidArray[1];

        var data = {
          "acc": this.acc,
          "aid": this.aid,
          "etype": "async",
          "cp": {
              "userid": userId,
              "experimentid": eid,
              "candidateid": cid,
              "sessionId": sessionId
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
