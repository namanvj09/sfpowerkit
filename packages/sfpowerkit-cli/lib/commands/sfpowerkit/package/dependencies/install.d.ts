import { flags, SfdxCommand } from "@salesforce/command";
export default class Install extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    individualpackage: flags.Discriminated<flags.Option<string>>;
    installationkeys: flags.Discriminated<flags.Option<string>>;
    branch: flags.Discriminated<flags.Option<string>>;
    tag: flags.Discriminated<flags.Option<string>>;
    wait: flags.Discriminated<flags.Option<string>>;
    noprompt: flags.Discriminated<flags.Boolean<boolean>>;
    updateall: flags.Discriminated<flags.Boolean<boolean>>;
    apexcompileonlypackage: flags.Discriminated<flags.Boolean<boolean>>;
    usedependencyvalidatedpackages: flags.Discriminated<flags.Boolean<boolean>>;
    filterpaths: flags.Discriminated<flags.Array<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  protected static requiresDevhubUsername: boolean;
  protected static requiresProject: boolean;
  private tagMap;
  private branchMap;
  run(): Promise<any>;
  private getPackageVersionDetails;
  private getInstalledPackages;
  private parseKeyValueMapfromString;
}
