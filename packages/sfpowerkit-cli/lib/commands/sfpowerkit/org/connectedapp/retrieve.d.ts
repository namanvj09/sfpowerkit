import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Retrieve extends SfdxCommand {
  connectedapp_consumerKey: string;
  static description: string;
  static examples: string[];
  protected static requiresUsername: boolean;
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
  };
  run(): Promise<AnyJson>;
}
