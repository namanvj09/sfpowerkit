import { SfdxCommand, FlagsConfig, SfdxResult } from "@salesforce/command";
export default class Merge extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  protected static requiresUsername: boolean;
  protected static requiresProject: boolean;
  static result: SfdxResult;
  run(): Promise<any>;
}
