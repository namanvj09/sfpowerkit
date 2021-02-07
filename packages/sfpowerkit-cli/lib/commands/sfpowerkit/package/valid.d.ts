import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Valid extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    package: flags.Discriminated<flags.Option<string>>;
    bypass: flags.Discriminated<flags.Array<string>>;
    apiversion: flags.Builtin;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresProject: boolean;
  private coverageJSON;
  run(): Promise<AnyJson>;
  validate(packageToBeScanned: AnyJson): Promise<SFDXPackage>;
  useCustomCoverageJSON(): void;
  isNotDefaultApiVersion(): boolean;
}
export declare class SFDXPackage {
  unsupportedtypes: any[];
  supportedTypes: any[];
  typesToBypass: any[];
  packageName: string;
  valid: boolean;
  processed: boolean;
}
