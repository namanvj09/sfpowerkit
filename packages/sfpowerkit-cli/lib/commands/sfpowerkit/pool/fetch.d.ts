import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Fetch extends SfdxCommand {
  static description: string;
  protected static requiresDevhubUsername: boolean;
  static examples: string[];
  protected static flagsConfig: {
    tag: flags.Discriminated<flags.Option<string>>;
    mypool: flags.Discriminated<flags.Boolean<boolean>>;
    sendtouser: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
}
