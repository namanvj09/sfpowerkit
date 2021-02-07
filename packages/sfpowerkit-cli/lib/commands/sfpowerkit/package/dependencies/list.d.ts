import { flags, SfdxCommand } from "@salesforce/command";
export default class List extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    filterpaths: flags.Discriminated<flags.Array<string>>;
    updateproject: flags.Discriminated<flags.Boolean<boolean>>;
    usedependencyvalidatedpackages: flags.Discriminated<flags.Boolean<boolean>>;
  };
  protected static requiresDevhubUsername: boolean;
  protected static requiresProject: boolean;
  run(): Promise<any>;
  private getPackageVersionDetails;
}
