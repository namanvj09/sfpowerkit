import { SfdxCommand, FlagsConfig } from "@salesforce/command";
export default class Destruct extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: FlagsConfig;
  protected static requiresUsername: boolean;
  run(): Promise<any>;
  private generateCacheDirectory;
  private copyAndValidateDestructiveManifest;
  private generateEmptyPackageXml;
  private generateDeploymentZipFile;
  private deployDestructiveManifest;
}
