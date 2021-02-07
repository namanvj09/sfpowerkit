"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
let retry = require("async-retry");
class PackageInfo {
  constructor(conn, apiversion) {
    this.conn = conn;
    this.apiversion = apiversion;
  }
  getPackages() {
    return __awaiter(this, void 0, void 0, function* () {
      let packageDetails = yield this.getInstalledPackages(this.conn, true);
      return packageDetails;
    });
  }
  getInstalledPackages(conn, fetchLicenses) {
    return __awaiter(this, void 0, void 0, function* () {
      let packageDetails = [];
      let installedPackagesQuery =
        "SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, " +
        "SubscriberPackageVersion.Id, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, " +
        "SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber, SubscriberPackageVersion.Package2ContainerOptions, SubscriberPackageVersion.IsOrgDependent FROM InstalledSubscriberPackage " +
        "ORDER BY SubscriberPackageId";
      let packageNamespacePrefixList = [];
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let results = yield conn.tooling.query(installedPackagesQuery);
            const records = results.records;
            if (records && records.length > 0) {
              records.forEach((record) => {
                const packageDetail = {};
                packageDetail.packageName = record["SubscriberPackage"]["Name"];
                packageDetail.subcriberPackageId =
                  record["SubscriberPackageId"];
                packageDetail.packageNamespacePrefix =
                  record["SubscriberPackage"]["NamespacePrefix"];
                packageDetail.packageVersionId =
                  record["SubscriberPackageVersion"]["Id"];
                packageDetail.packageVersionNumber = `${record["SubscriberPackageVersion"]["MajorVersion"]}.${record["SubscriberPackageVersion"]["MinorVersion"]}.${record["SubscriberPackageVersion"]["PatchVersion"]}.${record["SubscriberPackageVersion"]["BuildNumber"]}`;
                packageDetail.type =
                  record["SubscriberPackageVersion"][
                    "Package2ContainerOptions"
                  ];
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
                yield conn.query(packageLicensingQuery).then((queryResult) => {
                  if (queryResult.records && queryResult.records.length > 0) {
                    queryResult.records.forEach((record) => {
                      let licenseDetailObj = {};
                      licenseDetailObj.allowedLicenses =
                        record["AllowedLicenses"] > 0
                          ? record["AllowedLicenses"]
                          : 0;
                      licenseDetailObj.usedLicenses = record["UsedLicenses"];
                      licenseDetailObj.expirationDate =
                        record["ExpirationDate"];
                      licenseDetailObj.status = record["Status"];
                      licenseMap.set(
                        record["NamespacePrefix"],
                        licenseDetailObj
                      );
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
                    let licDetail = licenseMap.get(
                      detail.packageNamespacePrefix
                    );
                    detail.allowedLicenses = licDetail.allowedLicenses;
                    detail.usedLicenses = licDetail.usedLicenses;
                    detail.expirationDate = licDetail.expirationDate;
                    detail.status = licDetail.status;
                  }
                });
              }
            }
            return packageDetails;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  getPackagesDetailsfromDevHub(hubconn, pkgDetails) {
    return __awaiter(this, void 0, void 0, function* () {
      let pkgIds = [];
      pkgDetails.forEach((pkg) => {
        if (pkg.type === "Unlocked") {
          pkgIds.push(pkg.packageVersionId);
        }
      });
      let pkdIdsAsString = pkgIds.join(`','`);
      if (pkgIds.length > 0) {
        let installedPackagesQuery = `SELECT SubscriberPackageVersionId, HasPassedCodeCoverageCheck,CodeCoverage,ValidationSkipped FROM Package2Version WHERE SubscriberPackageVersionId IN('${pkdIdsAsString}')`;
        let response = yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              return yield hubconn.tooling.query(installedPackagesQuery);
            }),
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
    });
  }
}
exports.default = PackageInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZUluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZS92ZXJzaW9uL1BhY2thZ2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLE1BQXFCLFdBQVc7SUFJOUIsWUFDRSxJQUFnQixFQUNoQixVQUFrQjtRQUVsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRVksV0FBVzs7WUFDdEIsSUFBSSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RSxPQUFPLGNBQWMsQ0FBQztRQUN4QixDQUFDO0tBQUE7SUFHWSxvQkFBb0IsQ0FDL0IsSUFBZ0IsRUFDaEIsYUFBc0I7O1lBRXRCLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUV4QixJQUFJLHNCQUFzQixHQUN4Qiw2RkFBNkY7Z0JBQzdGLDRJQUE0STtnQkFDNUksME1BQTBNO2dCQUMxTSw4QkFBOEIsQ0FBQztZQUVqQyxJQUFJLDBCQUEwQixHQUFHLEVBQUUsQ0FBQztZQUVwQyxPQUFPLE1BQU0sS0FBSyxDQUNoQixDQUFNLElBQUksRUFBQyxFQUFFO2dCQUNYLElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFFaEMsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3ZCLE1BQU0sYUFB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
