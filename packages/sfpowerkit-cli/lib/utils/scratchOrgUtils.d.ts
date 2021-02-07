import { Org } from "@salesforce/core";
import { SfdxApi } from "../sfdxnode/types";
export default class ScratchOrgUtils {
  static isNewVersionCompatible: boolean;
  private static isVersionCompatibilityChecked;
  static checkForNewVersionCompatible(hubOrg: Org): Promise<boolean>;
  static getScratchOrgLimits(hubOrg: Org, apiversion: string): Promise<any>;
  static getScratchOrgRecordsAsMapByUser(hubOrg: Org): Promise<any>;
  private static getScratchOrgLoginURL;
  static createScratchOrg(
    sfdx: SfdxApi,
    id: number,
    adminEmail: string,
    config_file_path: string,
    expiry: number,
    hubOrg: Org
  ): Promise<ScratchOrg>;
  static shareScratchOrgThroughEmail(
    emailId: string,
    scratchOrg: ScratchOrg,
    hubOrg: Org
  ): Promise<void>;
  static getScratchOrgRecordId(
    scratchOrgs: ScratchOrg[],
    hubOrg: Org
  ): Promise<any>;
  static setScratchOrgInfo(soInfo: any, hubOrg: Org): Promise<boolean>;
  static getScratchOrgsByTag(
    tag: string,
    hubOrg: Org,
    isMyPool: boolean,
    unAssigned: boolean
  ): Promise<any>;
  static getActiveScratchOrgsByInfoId(
    hubOrg: Org,
    scrathOrgIds: string
  ): Promise<any>;
  static getCountOfActiveScratchOrgsByTag(
    tag: string,
    hubOrg: Org
  ): Promise<number>;
  static getCountOfActiveScratchOrgsByTagAndUsername(
    tag: string,
    hubOrg: Org
  ): Promise<number>;
  static getActiveScratchOrgRecordIdGivenScratchOrg(
    hubOrg: Org,
    apiversion: string,
    scratchOrgId: string
  ): Promise<any>;
  static deleteScratchOrg(hubOrg: Org, scratchOrgIds: string[]): Promise<void>;
  private static arrayToObject;
  static checkForPreRequisite(hubOrg: Org): Promise<any>;
}
export interface ScratchOrg {
  tag?: string;
  recordId?: string;
  orgId?: string;
  loginURL?: string;
  signupEmail?: string;
  username?: string;
  alias?: string;
  password?: string;
  isScriptExecuted?: boolean;
  expityDate?: string;
  accessToken?: string;
  instanceURL?: string;
  status?: string;
}
