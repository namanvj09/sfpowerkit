import { SfdxCommand, FlagsConfig } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Diff extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  protected static requiresUsername: boolean;
  protected static requiresProject: boolean;
  run(): Promise<AnyJson>;
}
