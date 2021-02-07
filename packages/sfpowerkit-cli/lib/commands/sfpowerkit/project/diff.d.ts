import { SfdxCommand, FlagsConfig, SfdxResult } from "@salesforce/command";
export default class Diff extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  static result: SfdxResult;
  protected static requiresUsername: boolean;
  protected static requiresProject: boolean;
  run(): Promise<any>;
}
