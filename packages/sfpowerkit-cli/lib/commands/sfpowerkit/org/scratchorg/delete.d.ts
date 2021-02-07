import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Delete extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static requiresDevhubUsername: boolean;
  protected static flagsConfig: {
    email: flags.Discriminated<flags.Option<string>>;
    username: flags.Discriminated<flags.Option<string>>;
  };
  run(): Promise<AnyJson>;
  private getActiveScratchOrgsForUser;
}
