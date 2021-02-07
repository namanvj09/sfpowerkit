import { Connection } from "jsforce";
export default class PackageVersionCoverage {
  constructor();
  getCoverage(
    versionId: string[],
    versionNumber: string,
    packageName: string,
    conn: Connection
  ): Promise<PackageCoverage[]>;
  private getWhereClause;
  private buildWhereFilter;
  private buildWhereOnNameOrId;
  private buildVersionNumberFilter;
}
interface PackageCoverage {
  coverage: number;
  packageName: string;
  packageId: string;
  packageVersionNumber: string;
  packageVersionId: string;
  HasPassedCodeCoverageCheck: Boolean;
}
export {};
