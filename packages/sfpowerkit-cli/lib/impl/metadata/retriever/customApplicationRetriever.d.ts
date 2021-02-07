import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
import { CustomApplication } from "../schema";
export default class CustomApplicationRetriever extends BaseMetadataRetriever<CustomApplication> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): CustomApplicationRetriever;
  getObjects(): Promise<CustomApplication[]>;
  getApps(): Promise<CustomApplication[]>;
  appExists(application: string): Promise<boolean>;
}
