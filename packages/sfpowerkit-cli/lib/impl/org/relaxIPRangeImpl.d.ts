import { Connection } from "@salesforce/core";
export default class RelaxIPRangeImpl {
  static setIp(
    conn: Connection,
    username: string,
    ipRangeToSet: any[],
    addall?: Boolean,
    removeall?: Boolean
  ): Promise<{
    username: string;
    success: boolean;
  }>;
  static getFullRange(): any[];
}
