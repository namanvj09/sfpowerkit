import { UserLicence } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class UserLicenseRetriever extends BaseMetadataRetriever<UserLicence> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): UserLicenseRetriever;
  getObjects(): Promise<UserLicence[]>;
  getUserLicenses(): Promise<UserLicence[]>;
  userLicenseExists(license: string): Promise<boolean>;
}
