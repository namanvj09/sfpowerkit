import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Info extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    showonlylatest: flags.Discriminated<flags.Boolean<boolean>>;
  };
  protected static requiresDevhubUsername: boolean;
  run(): Promise<AnyJson>;
  private getSandboxInfo;
  private processSandboxInfo;
  private getDetailedSandboxInfo;
}
