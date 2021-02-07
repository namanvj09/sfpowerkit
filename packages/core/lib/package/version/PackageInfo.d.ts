import { Connection } from "jsforce";
export default class PackageInfo {
  conn: Connection;
  apiversion: string;
  constructor(conn: Connection, apiversion: string);
  getPackages(): Promise<PackageDetail[]>;
  getInstalledPackages(
    conn: Connection,
    fetchLicenses: boolean
  ): Promise<PackageDetail[]>;
  getPackagesDetailsfromDevHub(
    hubconn: Connection,
    pkgDetails: PackageDetail[]
  ): Promise<PackageDetail[]>;
}
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
  isOrgDependent: boolean;
  codeCoverage: number;
  codeCoverageCheckPassed: boolean;
  validationSkipped: boolean;
}
