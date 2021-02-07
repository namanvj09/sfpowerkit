import { core, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class HealthCheck extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
  getOrgHealthScore(conn: core.Connection): Promise<any>;
  getOrgHealthHighRisks(conn: core.Connection): Promise<any>;
  getOrgHealthMediumRisks(conn: core.Connection): Promise<any>;
  getOrgHealthLowRisks(conn: core.Connection): Promise<any>;
  getInformationalRisks(conn: core.Connection): Promise<any>;
}
export declare class HealthResult {
  score: number;
  highriskitems: string[];
  mediumriskitems: string[];
  lowriskitems: string[];
  informationalriskitems: string[];
  constructor();
}
