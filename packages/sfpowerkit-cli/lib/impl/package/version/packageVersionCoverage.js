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
const sfpowerkit_1 = require("../../../sfpowerkit");
const core_1 = require("@salesforce/core");
const QUERY_string = `SELECT SubscriberPackageVersionId,Package2Id, Package2.Name,MajorVersion,MinorVersion,PatchVersion,BuildNumber, CodeCoverage, HasPassedCodeCoverageCheck, Name FROM Package2Version WHERE `;
const DEFAULT_ORDER_BY_FIELDS =
  "Package2Id, MajorVersion, MinorVersion, PatchVersion, BuildNumber";
class PackageVersionCoverage {
  constructor() {}
  getCoverage(versionId, versionNumber, packageName, conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let whereClause = yield this.getWhereClause(
        versionId,
        versionNumber,
        packageName
      );
      if (!whereClause) {
        throw new Error(
          "Either versionId or versionNumber and packageName is mandatory"
        );
      }
      let output = [];
      const result = yield conn.tooling.query(
        `${QUERY_string} ${whereClause} ORDER BY ${DEFAULT_ORDER_BY_FIELDS}`
      );
      if (result && result.size > 0) {
        result.records.forEach((record) => {
          var packageCoverage = {};
          packageCoverage.HasPassedCodeCoverageCheck =
            record.HasPassedCodeCoverageCheck;
          packageCoverage.coverage = record.CodeCoverage
            ? record.CodeCoverage.apexCodeCoveragePercentage
            : 0;
          packageCoverage.packageId = record.Package2Id;
          packageCoverage.packageName = record.Package2.Name;
          packageCoverage.packageVersionId = record.SubscriberPackageVersionId;
          packageCoverage.packageVersionNumber = `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}.${record.BuildNumber}`;
          output.push(packageCoverage);
        });
        sfpowerkit_1.SFPowerkit.log(
          `Successfully Retrieved the Apex Test Coverage of the package version`,
          core_1.LoggerLevel.INFO
        );
      } else {
        throw new Error(
          `Package version doesnot exist, Please check the version details`
        );
      }
      return output;
    });
  }
  getWhereClause(versionId, versionNumber, packageName) {
    return __awaiter(this, void 0, void 0, function* () {
      var whereClause = "";
      if (versionId && versionId.length > 0) {
        whereClause = this.buildWhereFilter(
          "SubscriberPackageVersionId",
          versionId
        );
      } else if (versionNumber && packageName) {
        whereClause =
          this.buildWhereOnNameOrId(
            "0Ho",
            "Package2Id",
            "Package2.Name",
            packageName
          ) +
          " AND " +
          this.buildVersionNumberFilter(versionNumber);
      }
      return whereClause;
    });
  }
  // buid the where clause IN or = based on length
  buildWhereFilter(key, value) {
    var result = "";
    if (value.length > 1) {
      result = `${key} IN ('${value.join("','")}')`;
    } else {
      result = `${key}  = '${value[0]}'`;
    }
    return result;
  }
  //build where clause based of id or name
  buildWhereOnNameOrId(idFilter, idKey, nameKey, value) {
    var result = "";
    if (value.startsWith(idFilter)) {
      result = `${idKey} = '${value}' `;
    } else {
      result = `${nameKey} = '${value}' `;
    }
    return result;
  }
  buildVersionNumberFilter(versionNumber) {
    var result = "";
    let versionNumberList = versionNumber.split(".");
    if (versionNumberList.length === 4) {
      result = `MajorVersion = ${versionNumberList[0]} AND MinorVersion = ${versionNumberList[1]} AND PatchVersion = ${versionNumberList[2]} AND BuildNumber = ${versionNumberList[3]}`;
    } else {
      throw new Error(
        "Provide complete version number format in major.minor.patch (Beta build)—for example, 1.2.0.5"
      );
    }
    return result;
  }
}
exports.default = PackageVersionCoverage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZVZlcnNpb25Db3ZlcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL3BhY2thZ2UvdmVyc2lvbi9wYWNrYWdlVmVyc2lvbkNvdmVyYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsb0RBQWlEO0FBQ2pELDJDQUErQztBQUcvQyxNQUFNLFlBQVksR0FBRyw0TEFBNEwsQ0FBQztBQUNsTixNQUFNLHVCQUF1QixHQUMzQixtRUFBbUUsQ0FBQztBQUN0RSxNQUFxQixzQkFBc0I7SUFDekMsZ0JBQXNCLENBQUM7SUFFVixXQUFXLENBQ3RCLFNBQW1CLEVBQ25CLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLElBQWdCOztZQUVoQixJQUFJLFdBQVcsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FDMUMsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLENBQ1osQ0FBVyxDQUFDO1lBRWIsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FDYixnRUFBZ0UsQ0FDakUsQ0FBQzthQUNIO1lBRUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRWhCLE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDdEMsR0FBRyxZQUFZLElBQUksV0FBVyxhQUFhLHVCQUF1QixFQUFFLENBQ3JFLENBQVEsQ0FBQztZQUNWLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDOUIsSUFBSSxlQUFlLEdBQW9CLEVBQUUsQ0FBQztvQkFDMUMsZUFBZSxDQUFDLDBCQUEwQjt3QkFDeEMsTUFBTSxDQUFDLDBCQUEwQixDQUFDO29CQUNwQyxlQUFlLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FB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
