import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class List extends SfdxCommand {
  protected static requiresProject: boolean;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    path: flags.Discriminated<flags.Option<string>>;
    resultasstring: flags.Discriminated<flags.Boolean<boolean>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
}
