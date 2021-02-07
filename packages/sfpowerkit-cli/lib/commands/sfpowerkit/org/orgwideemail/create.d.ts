import { SfdxCommand, FlagsConfig } from "@salesforce/command";
export default class OrgWideEmail extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  protected static requiresUsername: boolean;
  run(): Promise<any>;
}
