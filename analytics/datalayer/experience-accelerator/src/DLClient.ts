import { Client } from "./Client";

export class DLClient extends Client {
    constructor(
        public readonly maxWaitTime = 5000
    ) {
        super(maxWaitTime);
    }

    sendMetrics(type: string, event: any) {
        var uid = this.getUid(event);
        let cidEid = this.getCidEid(event);

        this.setDataLayerVars(uid, cidEid);
    }

    setDataLayerVars(userId: string, cidEid: string) {
        // CS integration should resplit the eid and cid
        var cidEidArray = cidEid.split(':');

        // Make the whole thing the CID as you might have a third
        // field for cloned candidates
        var cid = cidEidArray.join(':');
        var eid = cidEidArray[1];
        
        // write cid and eid to data layer as comma separated list
        this.getEvolv().context.cid = this.getEvolv().context.cid ? (cid + "," + this.getEvolv().context.cid) : cid;
        this.getEvolv().context.eid = this.getEvolv().context.eid ? (eid + "," + this.getEvolv().context.eid) : eid;
      }
}
