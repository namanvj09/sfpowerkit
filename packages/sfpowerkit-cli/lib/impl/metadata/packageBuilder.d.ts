import { Connection } from "jsforce";
/**
 * This code was adapted from github:sfdx-jayree-plugin project which was
 * based on the original github:sfdx-hydrate project
 */
export declare class Packagexml {
  configs: BuildConfig;
  private conn;
  private packageTypes;
  private ipRegex;
  private ipPromise;
  result: {
    type: string;
    createdById?: string;
    createdByName?: string;
    createdDate?: string;
    fileName?: string;
    fullName: string;
    id?: string;
    lastModifiedById?: string;
    lastModifiedByName?: string;
    lastModifiedDate?: string;
    manageableState?: string;
    namespacePrefix?: string;
  }[];
  constructor(conn: Connection, configs: BuildConfig);
  build(): Promise<any>;
  private buildInstalledPackageRegex;
  private describeMetadata;
  private generateXml;
  private handleFolderedObjects;
  private handleUnfolderedObjects;
  private addMember;
}
export declare class BuildConfig {
  quickFilters: string[];
  excludeManaged: boolean;
  includeChilds: boolean;
  apiVersion: string;
  targetDir: string;
  outputFile: string;
  constructor(flags: object, apiVersion: string);
}
