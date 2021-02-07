import { Connection } from "@salesforce/core";
export declare function retrieveMetadata(
  types: any,
  connection: Connection
): Promise<string[]>;
