import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Create extends SfdxCommand {
  customlabel_fullname: string;
  customlabel_categories: string;
  customlabel_language: string;
  customlabel_protected: boolean;
  customlabel_shortdescription: string;
  customlabel_value: string;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    fullname: flags.Discriminated<flags.Option<string>>;
    value: flags.Discriminated<flags.Option<string>>;
    categories: flags.Discriminated<flags.Option<string>>;
    language: flags.Discriminated<flags.Option<string>>;
    protected: flags.Discriminated<flags.Option<string>>;
    shortdescription: flags.Discriminated<flags.Option<string>>;
    package: flags.Discriminated<flags.Option<string>>;
    ignorepackage: flags.Discriminated<flags.Boolean<boolean>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  protected static requiresProject: boolean;
  run(): Promise<AnyJson>;
}
