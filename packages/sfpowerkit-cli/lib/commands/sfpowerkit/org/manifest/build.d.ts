import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Build extends SfdxCommand {
  static description: string;
  static examples: string[];
  static args: {
    name: string;
  }[];
  protected static flagsConfig: {
    quickfilter: flags.Discriminated<flags.Option<string>>;
    excludemanaged: flags.Discriminated<flags.Boolean<boolean>>;
    includechilds: flags.Discriminated<flags.Boolean<boolean>>;
    outputfile: flags.Discriminated<flags.Option<string>>;
  };
  protected static requiresUsername: boolean;
  protected static supportsDevhubUsername: boolean;
  protected static requiresProject: boolean;
  run(): Promise<AnyJson>;
}
