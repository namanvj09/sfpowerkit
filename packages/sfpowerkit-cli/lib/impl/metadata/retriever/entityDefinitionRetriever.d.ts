import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
import { EntityDefinition } from "../schema";
export default class EntityDefinitionRetriever extends BaseMetadataRetriever<EntityDefinition> {
  org: Org;
  private static instance;
  private objectForPermission;
  private describePromise;
  private constructor();
  static getInstance(org: Org): EntityDefinitionRetriever;
  getObjects(): Promise<EntityDefinition[]>;
  getEntityDefinitions(): Promise<EntityDefinition[]>;
  getObjectForPermission(): Promise<string[]>;
  existObjectPermission(object: string): Promise<boolean>;
  existCustomMetadata(custonObjectStr: string): Promise<boolean>;
}
