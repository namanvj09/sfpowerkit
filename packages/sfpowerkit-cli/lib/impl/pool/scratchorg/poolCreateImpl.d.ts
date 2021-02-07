import { ScratchOrg } from "../../../utils/scratchOrgUtils";
import { Org } from "@salesforce/core";
import { SfdxApi } from "../../../sfdxnode/types";
export default class PoolCreateImpl {
  private poolconfigFilePath;
  private hubOrg;
  private apiversion;
  private sfdx;
  private batchSize;
  private hubConn;
  private poolConfig;
  private totalToBeAllocated;
  private ipRangeExecResults;
  private ipRangeExecResultsAsObject;
  private limits;
  private scriptFileExists;
  private totalAllocated;
  private limiter;
  private scriptExecutorWrappedForBottleneck;
  private ipRangeRelaxerWrappedForBottleneck;
  constructor(
    poolconfigFilePath: string,
    hubOrg: Org,
    apiversion: string,
    sfdx: SfdxApi,
    batchSize: number
  );
  poolScratchOrgs(): Promise<boolean>;
  private validateScriptFile;
  private setASingleUserForTagOnlyMode;
  private fetchCurrentLimits;
  private computeAllocation;
  private generateScratchOrgs;
  private finalizeGeneratedScratchOrgs;
  private allocateScratchOrgsPerTag;
  private allocateScratchOrgsPerUser;
  private ipRangeRelaxer;
  private scriptExecutor;
  private arrayToObject;
}
export interface PoolConfig {
  pool: Pool;
  poolUsers: PoolUser[];
}
export interface Pool {
  expiry: number;
  config_file_path: string;
  script_file_path?: string;
  tag: string;
  user_mode: boolean;
  relax_all_ip_ranges: boolean;
  relax_ip_ranges: IpRanges[];
  max_allocation: number;
}
export interface PoolUser {
  max_allocation: number;
  min_allocation: number;
  is_build_pooluser: boolean;
  username?: string;
  expiry?: number;
  priority: number;
  scripts?: string[];
  current_allocation?: number;
  to_allocate?: number;
  to_satisfy_min?: number;
  to_satisfy_max?: number;
  scratchOrgs?: ScratchOrg[];
}
interface IpRanges {
  start: string;
  end: string;
}
export {};
