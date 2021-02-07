import { ApexClass } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class ApexClassRetriever extends BaseMetadataRetriever<ApexClass> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): ApexClassRetriever;
  getObjects(): Promise<ApexClass[]>;
  getClasses(): Promise<ApexClass[]>;
  classExists(cls: string): Promise<boolean>;
}
