import { flags, SfdxCommand } from "@salesforce/command";
import { Connection } from "@salesforce/core";
import { MetadataSummary } from "../../../../impl/metadata/retriever/metadataSummaryInfoFetcher";
import { PackageDetail } from "@dxatscale/sfpowerkit.core/lib/package/version/PackageInfo";
export default class Tree extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    package: flags.Discriminated<flags.Option<string>>;
    packagefilter: flags.Discriminated<flags.Boolean<boolean>>;
    showall: flags.Discriminated<flags.Boolean<boolean>>;
    format: flags.Discriminated<flags.Enum<string>>;
    output: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  protected conn: Connection;
  protected installedPackagesMap: Map<string, PackageDetail>;
  protected dependencyMap: Map<string, string[]>;
  protected metadataMap: Map<string, MetadataSummary>;
  protected output: any[];
  run(): Promise<any>;
  private getDetailsFromId;
  private generateJsonOutput;
  generateCSVOutput(result: any[], outputDir: string): Promise<void>;
}
