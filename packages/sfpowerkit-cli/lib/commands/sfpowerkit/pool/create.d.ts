import { SfdxCommand, FlagsConfig } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Create extends SfdxCommand {
  static description: string;
  protected static requiresDevhubUsername: boolean;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  run(): Promise<AnyJson>;
}
