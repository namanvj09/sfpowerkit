import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
import { TabDefinition } from "../schema";
export default class TabDefinitionRetriever extends BaseMetadataRetriever<TabDefinition> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): TabDefinitionRetriever;
  getObjects(): Promise<TabDefinition[]>;
  getTabs(): Promise<TabDefinition[]>;
  tabExists(tab: string): Promise<boolean>;
}
