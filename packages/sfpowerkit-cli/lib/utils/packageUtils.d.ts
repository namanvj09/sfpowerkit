import { Connection } from "jsforce";
export declare function getInstalledPackages(
  conn: Connection,
  fetchLicenses: boolean
): Promise<PackageDetail[]>;
export interface PackageDetail {
  packageName: string;
  subcriberPackageId: string;
  packageNamespacePrefix: string;
  packageVersionNumber: string;
  packageVersionId: string;
  allowedLicenses: number;
  usedLicenses: number;
  expirationDate: string;
  status: string;
  type: string;
  IsOrgDependent: boolean;
  CodeCoverage: number;
  codeCoverageCheckPassed: boolean;
  validationSkipped: boolean;
}
