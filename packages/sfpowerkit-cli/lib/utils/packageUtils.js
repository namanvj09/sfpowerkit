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
exports.getInstalledPackages = void 0;
let retry = require("async-retry");
function getInstalledPackages(conn, fetchLicenses) {
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
              packageDetail.subcriberPackageId = record["SubscriberPackageId"];
              packageDetail.packageNamespacePrefix =
                record["SubscriberPackage"]["NamespacePrefix"];
              packageDetail.packageVersionId =
                record["SubscriberPackageVersion"]["Id"];
              packageDetail.packageVersionNumber = `${record["SubscriberPackageVersion"]["MajorVersion"]}.${record["SubscriberPackageVersion"]["MinorVersion"]}.${record["SubscriberPackageVersion"]["PatchVersion"]}.${record["SubscriberPackageVersion"]["BuildNumber"]}`;
              packageDetail.type =
                record["SubscriberPackageVersion"]["Package2ContainerOptions"];
              packageDetail.IsOrgDependent =
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
        }),
      { retries: 3, minTimeout: 3000 }
    );
  });
}
exports.getInstalledPackages = getInstalledPackages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZVV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3BhY2thZ2VVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFbkMsU0FBc0Isb0JBQW9CLENBQ3hDLElBQWdCLEVBQ2hCLGFBQXNCOztRQUV0QixJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFFeEIsSUFBSSxzQkFBc0IsR0FDeEIsNkZBQTZGO1lBQzdGLDRJQUE0STtZQUM1SSwwTUFBME07WUFDMU0sOEJBQThCLENBQUM7UUFFakMsSUFBSSwwQkFBMEIsR0FBRyxFQUFFLENBQUM7UUFFcEMsT0FBTyxNQUFNLEtBQUssQ0FDaEIsQ0FBTSxJQUFJLEVBQUMsRUFBRTtZQUNYLElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUMvRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBRWhDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN2QixNQUFNLGFBQWEsR0FBRyxFQUFtQixDQUFDO29CQUMxQyxhQUFhLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRSxhQUFhLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ2pFLGFBQWEsQ0FBQyxzQkFBc0I7d0JBQ2xDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ2pELGFBQWEsQ0FBQyxnQkFBZ0I7d0JBQzVCLE1BQU0sQ0FBQywwQkFBMEIsQ0FB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
