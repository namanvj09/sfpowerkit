import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Generatepatch extends SfdxCommand {
  protected static requiresProject: boolean;
  private folderPath;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    package: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  run(): Promise<AnyJson>;
  private generatePatchForCustomPicklistField;
  private generatePatchForRecordTypes;
  private generateStaticResource;
}
