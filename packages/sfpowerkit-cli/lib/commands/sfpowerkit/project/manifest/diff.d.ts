import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Diff extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    sourcepath: flags.Discriminated<flags.Option<string>>;
    targetpath: flags.Discriminated<flags.Option<string>>;
    output: flags.Discriminated<flags.Option<string>>;
    apiversion: flags.Builtin;
    format: flags.Discriminated<flags.Enum<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected output: any[];
  run(): Promise<AnyJson>;
  processMainfest(pathToManifest: string): Promise<Map<string, string[]>>;
  compareXML(
    sourceXml: Map<string, string[]>,
    targetXml: Map<string, string[]>
  ): any[];
  getdiffList(from: string[], to: string[]): any[];
  addItemsToOutput(itemsToProcess: any[], status: string): void;
  createpackagexml(manifest: any[]): void;
  generateCSVOutput(output: any[]): void;
}
