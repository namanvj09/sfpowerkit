import { Org } from "@salesforce/core";
export default class OrgDiffImpl {
  private filesOrFolders;
  private org;
  private addConflictMarkers;
  private output;
  constructor(filesOrFolders: string[], org: Org, addConflictMarkers: boolean);
  orgDiff(): Promise<any[]>;
  private buildPackageObj;
  private handleUnsplitedMetadatas;
  private compare;
  private processFile;
  private processResult;
  private retrievePackage;
}
