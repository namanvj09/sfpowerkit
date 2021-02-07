import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Buildmanifest extends SfdxCommand {
  output: string[];
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    path: flags.Discriminated<flags.Array<string>>;
    manifest: flags.Discriminated<flags.Option<string>>;
    apiversion: flags.Builtin;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
  setoutput(label: string): void;
  getlabels(labelpath: string): Promise<void>;
  validatepackagexml(manifest: string): Promise<string>;
  createpackagexml(manifest: string): void;
  checklabelspackagexml(manifest: string): Promise<void>;
  setlabelutil(members: any): void;
  setlabels(manifest: string): Promise<void>;
}
