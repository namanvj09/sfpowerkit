import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Relaxiprange extends SfdxCommand {
  connectedapp_consumerKey: string;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    range: flags.Discriminated<flags.Array<string>>;
    all: flags.Discriminated<flags.Boolean<boolean>>;
    none: flags.Discriminated<flags.Boolean<boolean>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
}
