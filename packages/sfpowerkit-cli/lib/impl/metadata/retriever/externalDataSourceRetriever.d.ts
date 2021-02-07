import { ExternalDataSource } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class ExternalDataSourceRetriever extends BaseMetadataRetriever<ExternalDataSource> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): ExternalDataSourceRetriever;
  getObjects(): Promise<ExternalDataSource[]>;
  getExternalDataSources(): Promise<ExternalDataSource[]>;
  externalDataSourceExists(dataSource: string): Promise<boolean>;
}
