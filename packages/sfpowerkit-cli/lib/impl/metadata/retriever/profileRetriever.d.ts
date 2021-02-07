import Profile from "../schema";
import MetadataFiles from "../metadataFiles";
import { Connection, Org } from "@salesforce/core";
import { MetadataInfo } from "jsforce";
import { ProfileTooling } from "../schema";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class ProfileRetriever extends BaseMetadataRetriever<ProfileTooling> {
  org: Org;
  private debugFlag?;
  static supportedMetadataTypes: string[];
  supportedPermissions: string[];
  conn: Connection;
  metadataFiles: MetadataFiles;
  constructor(org: Org, debugFlag?: boolean);
  loadSupportedPermissions(): Promise<void>;
  loadProfiles(profileNames: string[], conn: any): Promise<MetadataInfo[]>;
  handlePermissions(profileObj: Profile): Promise<Profile>;
  private completeUserPermissions;
  private hasPermission;
  private completeObjects;
  private static buildObjPermArray;
  private static filterObjects;
  private togglePermission;
  private enablePermission;
  private handleQueryAllFilesPermission;
  private handleViewAllDataPermission;
  private handleInstallPackagingPermission;
  getUnsupportedLicencePermissions(licence: string): any;
  /**
   * Return All profile object from the connected Org
   */
  getProfiles(): Promise<ProfileTooling[]>;
  /**
   * Get a profile by Profile Name
   * @param name The name of the profile to return
   */
  getProfileByName(name: string): Promise<ProfileTooling>;
}
