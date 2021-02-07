import { SfdxCommand, FlagsConfig } from "@salesforce/command";
export default class Pmd extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  private javahome;
  run(): Promise<any>;
  private findJavaHomeAsync;
  private downloadPMD;
  protected parseXmlReport(
    xmlReport: string,
    moduleName: string
  ): [number, number];
}
