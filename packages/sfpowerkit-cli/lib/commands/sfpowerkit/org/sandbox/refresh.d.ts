import { core, flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Refresh extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    clonefrom: flags.Discriminated<flags.Option<string>>;
    licensetype: flags.Discriminated<flags.Option<string>>;
  };
  protected static requiresDevhubUsername: boolean;
  run(): Promise<AnyJson>;
  getSandboxId(conn: core.Connection, name: string): Promise<any>;
}
