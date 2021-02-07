import { FlagsConfig, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class OrgCoverage extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
  private getApexCoverage;
  private getApexCoverageByDetails;
  private percentCalculate;
  private getComments;
  private generateJsonOutput;
  private generateCSVOutput;
  private getmetadataVsPackageMap;
}
export declare class ApexCoverage {
  coverage: number;
}
