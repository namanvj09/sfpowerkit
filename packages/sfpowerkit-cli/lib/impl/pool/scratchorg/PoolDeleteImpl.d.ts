import { Org } from "@salesforce/core";
import { ScratchOrg } from "../../../utils/scratchOrgUtils";
export default class PoolDeleteImpl {
  private hubOrg;
  private apiversion;
  private tag;
  private mypool;
  private allScratchOrgs;
  private inprogressonly;
  constructor(
    hubOrg: Org,
    apiversion: string,
    tag: string,
    mypool: boolean,
    allScratchOrgs: boolean,
    inprogressonly: boolean
  );
  execute(): Promise<ScratchOrg[]>;
}
