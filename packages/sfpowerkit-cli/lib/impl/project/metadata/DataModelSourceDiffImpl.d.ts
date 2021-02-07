export default class DataModelSourceDiffImpl {
  git: any;
  baseline: string;
  target: string;
  packageDirectories: string[];
  constructor(
    git: any,
    baseline: string,
    target: string,
    packageDirectories: string[]
  );
  private diffGenerators;
  private filePattern;
  exec(): Promise<any>;
  private getNameOfChangedFiles;
  private filterByPackageDirectory;
}
