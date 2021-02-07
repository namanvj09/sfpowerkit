import { RecordType } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class RecordTypeRetriever extends BaseMetadataRetriever<RecordType> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): RecordTypeRetriever;
  getObjects(): Promise<RecordType[]>;
  getrecordTypes(): Promise<RecordType[]>;
  recordTypeExists(recordType: string): Promise<boolean>;
}
