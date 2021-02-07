import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Info extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    apiversion: flags.Builtin;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  static readonly supportsDevhubUsername = true;
  run(): Promise<AnyJson>;
}
