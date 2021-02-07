import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Convert extends SfdxCommand {
  protected static requiresProject: boolean;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
}
