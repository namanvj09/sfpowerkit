import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Deactivate extends SfdxCommand {
  connectedapp_consumerKey: string;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
}
