import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Generate extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
}
