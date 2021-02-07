import { Org } from "@salesforce/core";
import { ScratchOrg } from "../../../utils/scratchOrgUtils";
export default class PoolListImpl {
  private hubOrg;
  private apiversion;
  private tag;
  private mypool;
  private allScratchOrgs;
  constructor(
    hubOrg: Org,
    apiversion: string,
    tag: string,
    mypool: boolean,
    allScratchOrgs: boolean
  );
  execute(): Promise<ScratchOrg[]>;
}
