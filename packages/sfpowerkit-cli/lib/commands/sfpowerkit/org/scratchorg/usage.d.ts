import { SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Usage extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static requiresDevhubUsername: boolean;
  run(): Promise<AnyJson>;
  private getScratchOrgLimits;
  private getScratchOrgInfo;
}
