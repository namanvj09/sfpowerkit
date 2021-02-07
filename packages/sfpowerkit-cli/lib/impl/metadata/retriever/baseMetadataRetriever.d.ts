import { Org } from "@salesforce/core";
export default abstract class BaseMetadataRetriever<T> {
  org: Org;
  private tooling;
  private query;
  private countQuery;
  protected cacheLoaded: boolean;
  protected data: any;
  protected dataLoaded: boolean;
  protected cacheFileName: string;
  protected objectName: string;
  protected constructor(org: Org, tooling?: boolean);
  protected setQuery(query: string): void;
  private generateCountQuery;
  protected getObjects(): Promise<T[]>;
  private getCount;
}
export declare function executeToolingQueryAsync(
  query: any,
  conn: any,
  object: any
): Promise<any[]>;
export declare function executeBulkQueryAsync(
  query: any,
  conn: any,
  object: any,
  recordCount: any
): Promise<any[]>;
export declare function executeQueryAsync(
  query: any,
  conn: any,
  object: any
): Promise<any[]>;
