import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Merge extends SfdxCommand {
  output: Map<string, string[]>;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    path: flags.Discriminated<flags.Array<string>>;
    manifest: flags.Discriminated<flags.Option<string>>;
    apiversion: flags.Builtin;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
  processMainfest(dir: string): Promise<void>;
  setOutput(key: string, values: string[]): void;
  createpackagexml(manifest: any[]): void;
}
