import { Layout } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class LayoutRetriever extends BaseMetadataRetriever<Layout> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): LayoutRetriever;
  getObjects(): Promise<Layout[]>;
  getLayouts(): Promise<Layout[]>;
  layoutExists(layout: string): Promise<boolean>;
}
