import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Applypatch extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  private folderPath;
  run(): Promise<AnyJson>;
}
