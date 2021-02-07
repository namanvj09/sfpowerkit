import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Reconcile extends SfdxCommand {
  private customlabel_path;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    path: flags.Discriminated<flags.Option<string>>;
    project: flags.Discriminated<flags.Option<string>>;
  };
  protected static requiresProject: boolean;
  run(): Promise<AnyJson>;
  isIterable(obj: any): boolean;
}
