import { SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Cleartestresult extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
  private deleteRecords;
}
