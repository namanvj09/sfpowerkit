import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
import { Field } from "../schema";
export default class FieldRetriever extends BaseMetadataRetriever<Field> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): FieldRetriever;
  getObjects(): Promise<Field[]>;
  getFields(): Promise<Field[]>;
  getFieldsByObjectName(objectName: string): Promise<Field[]>;
  fieldExist(fullName: string): Promise<boolean>;
}
