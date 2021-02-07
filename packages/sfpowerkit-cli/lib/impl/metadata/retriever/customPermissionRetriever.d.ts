import { CustomPermission } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class CustomPermissionRetriever extends BaseMetadataRetriever<CustomPermission> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): CustomPermissionRetriever;
  getObjects(): Promise<CustomPermission[]>;
  getCustomPermissions(): Promise<CustomPermission[]>;
  customPermissionExists(customPermissionStr: string): Promise<boolean>;
}
