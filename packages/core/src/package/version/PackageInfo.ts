import { Connection } from "jsforce";
let retry = require("async-retry");

export default class PackageInfo {
  conn: Connection;
  apiversion: string;

  public constructor(conn: Connection, apiversion: string) {
    this.conn = conn;
    this.apiversion = apiversion;
  }

  public async getPackages(): Promise<PackageDetail[]> {
    let packageDetails = await this.getInstalledPackages(this.conn, true);
    return packageDetails;
  }

  public async getInstalledPackages(
    conn: Connection,
    fetchLicenses: boolean
  ): Promise<PackageDetail[]> {
    let packageDetails = [];

    let installedPackagesQuery =
      "SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, " +
      "SubscriberPackageVersion.Id, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, " +
      "SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber, SubscriberPackageVersion.Package2ContainerOptions, SubscriberPackageVersion.IsOrgDependent FROM InstalledSubscriberPackage " +
      "ORDER BY SubscriberPackageId";

    let packageNamespacePrefixList = [];

    return await retry(
      async (bail) => {
        let results = await conn.tooling.query(installedPackagesQuery);
        const records = results.records;

        if (records && records.length > 0) {
          records.forEach((record) => {
            const packageDetail = {} as PackageDetail;
            packageDetail.packageName = record["SubscriberPackage"]["Name"];
            packageDetail.subcriberPackageId = record["SubscriberPackageId"];
            packageDetail.packageNamespacePrefix =
              record["SubscriberPackage"]["NamespacePrefix"];
            packageDetail.packageVersionId =
              record["SubscriberPackageVersion"]["Id"];
            packageDetail.packageVersionNumber = `${record["SubscriberPackageVersion"]["MajorVersion"]}.${record["SubscriberPackageVersion"]["MinorVersion"]}.${record["SubscriberPackageVersion"]["PatchVersion"]}.${record["SubscriberPackageVersion"]["BuildNumber"]}`;
            packageDetail.type =
              record["SubscriberPackageVersion"]["Package2ContainerOptions"];
            packageDetail.isOrgDependent =
              record["SubscriberPackageVersion"]["IsOrgDependent"];
            packageDetails.push(packageDetail);
            if (packageDetail.packageNamespacePrefix) {
              packageNamespacePrefixList.push(
                "'" + packageDetail.packageNamespacePrefix + "'"
              );
            }
          });
        }

        if (fetchLicenses) {
          let licenseMap = new Map();
          if (packageNamespacePrefixList.length > 0) {
            let packageLicensingQuery = `SELECT AllowedLicenses, UsedLicenses,ExpirationDate, NamespacePrefix, IsProvisioned, Status FROM PackageLicense  WHERE NamespacePrefix IN (${packageNamespacePrefixList})`;
            await conn.query(packageLicensingQuery).then((queryResult) => {
              if (queryResult.records && queryResult.records.length > 0) {
                queryResult.records.forEach((record) => {
                  let licenseDetailObj = {} as PackageDetail;
                  licenseDetailObj.allowedLicenses =
                    record["AllowedLicenses"] > 0
                      ? record["AllowedLicenses"]
                      : 0;
                  licenseDetailObj.usedLicenses = record["UsedLicenses"];
                  licenseDetailObj.expirationDate = record["ExpirationDate"];
                  licenseDetailObj.status = record["Status"];
                  licenseMap.set(record["NamespacePrefix"], licenseDetailObj);
                });
              }
            });
          }

          if (packageDetails.length > 0 && licenseMap.size > 0) {
            packageDetails.forEach((detail) => {
              if (
                detail.packageNamespacePrefix &&
                licenseMap.has(detail.packageNamespacePrefix)
              ) {
                let licDetail = licenseMap.get(detail.packageNamespacePrefix);
                detail.allowedLicenses = licDetail.allowedLicenses;
                detail.usedLicenses = licDetail.usedLicenses;
                detail.expirationDate = licDetail.expirationDate;
                detail.status = licDetail.status;
              }
            });
          }
        }

        return packageDetails;
      },
      { retries: 3, minTimeout: 3000 }
    );
  }

  public async getPackagesDetailsfromDevHub(
    hubconn: Connection,
    pkgDetails: PackageDetail[]
  ): Promise<PackageDetail[]> {
    let pkgIds: string[] = [];
    pkgDetails.forEach((pkg) => {
      if (pkg.type === "Unlocked") {
        pkgIds.push(pkg.packageVersionId);
      }
    });

    let pkdIdsAsString = pkgIds.join(`','`);

    if (pkgIds.length > 0) {
      let installedPackagesQuery = `SELECT SubscriberPackageVersionId, HasPassedCodeCoverageCheck,CodeCoverage,ValidationSkipped FROM Package2Version WHERE SubscriberPackageVersionId IN('${pkdIdsAsString}')`;

      let response = await retry(
        async (bail) => {
          return await hubconn.tooling.query(installedPackagesQuery);
        },
        { retries: 3, minTimeout: 3000 }
      );

      if (response.records && response.records.length > 0) {
        response.records.forEach((record) => {
          for (let pkg of pkgDetails) {
            if (pkg.packageVersionId === record.SubscriberPackageVersionId) {
              pkg.codeCoverageCheckPassed = record.HasPassedCodeCoverageCheck;
              pkg.codeCoverage = record.CodeCoverage
                ? record.CodeCoverage.apexCodeCoveragePercentage
                : 0;
              pkg.validationSkipped = record.ValidationSkipped;
            }
          }
        });
      }
    }

    return pkgDetails;
  }
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
