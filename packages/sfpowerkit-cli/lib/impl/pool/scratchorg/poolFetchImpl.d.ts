import { Org } from "@salesforce/core";
import { ScratchOrg } from "../../../utils/scratchOrgUtils";
export default class PoolFetchImpl {
  private hubOrg;
  private tag;
  private mypool;
  private sendToUser;
  constructor(hubOrg: Org, tag: string, mypool: boolean, sendToUser: string);
  execute(): Promise<ScratchOrg>;
}
