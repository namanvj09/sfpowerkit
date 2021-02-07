import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class CodeCoverage extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    package: flags.Discriminated<flags.Option<string>>;
    versionnumber: flags.Discriminated<flags.Option<string>>;
    versionid: flags.Discriminated<flags.Array<string>>;
    apiversion: flags.Builtin;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresDevhubUsername: boolean;
  run(): Promise<AnyJson>;
}
