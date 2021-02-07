export declare class DXProjectManifestUtils {
  private projectFolder;
  private sfdxProjectManifestJSON;
  constructor(projectFolder: string);
  removePackagesNotInDirectory(): void;
  private isElementExists;
}
