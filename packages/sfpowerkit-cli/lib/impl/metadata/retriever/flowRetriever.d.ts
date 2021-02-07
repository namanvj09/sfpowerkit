import { Flow } from "../schema";
import { Org } from "@salesforce/core";
import BaseMetadataRetriever from "./baseMetadataRetriever";
export default class FlowRetriever extends BaseMetadataRetriever<Flow> {
  org: Org;
  private static instance;
  private constructor();
  static getInstance(org: Org): FlowRetriever;
  getObjects(): Promise<Flow[]>;
  retrieveFlows(): Promise<Flow[]>;
  getFlows(): Promise<Flow[]>;
  flowExists(flowStr: string): Promise<boolean>;
}
