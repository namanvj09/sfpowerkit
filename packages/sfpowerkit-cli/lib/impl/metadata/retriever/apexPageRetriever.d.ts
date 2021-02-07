import { ApexPage } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class ApexPageRetriever extends BaseMetadataRetriever<ApexPage> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): ApexPageRetriever;
  getObjects(): Promise<ApexPage[]>;
  getPages(): Promise<ApexPage[]>;
  pageExists(page: string): Promise<boolean>;
}
