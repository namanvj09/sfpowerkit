"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultPackageInfo = exports.getPackageInfo = void 0;
const core_1 = require("@salesforce/core");
//Returns the info about a requested package
function getPackageInfo(packageJson, packageName) {
  //Find the default package or passed package as the parameter
  const packageDirectories = packageJson.get("packageDirectories") || [];
  let packageInfo;
  if (packageName) {
    packageInfo = packageDirectories.filter((it) => {
      return it["package"] === packageName;
    })[0];
    if (packageInfo == undefined) {
      throw new core_1.SfdxError("Invalid Package");
    }
  } else throw new core_1.SfdxError("Package Name is empty");
  return packageInfo;
}
exports.getPackageInfo = getPackageInfo;
//Returns the info about a requested package
function getDefaultPackageInfo(packageJson) {
  //Find the default package or passed package as the parameter
  const packageDirectories = packageJson.get("packageDirectories") || [];
  let packageInfo;
  packageInfo = packageDirectories.filter((it) => {
    return it["default"] == true;
  })[0];
  if (packageInfo == undefined) {
    throw new core_1.SfdxError("Default Package not found");
  }
  return packageInfo;
}
exports.getDefaultPackageInfo = getDefaultPackageInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2FnZUluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZ2V0UGFja2FnZUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQThEO0FBRzlELDRDQUE0QztBQUM1QyxTQUFnQixjQUFjLENBQzVCLFdBQTRCLEVBQzVCLFdBQW1CO0lBRW5CLDZEQUE2RDtJQUM3RCxNQUFNLGtCQUFrQixHQUNyQixXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFlLElBQUksRUFBRSxDQUFDO0lBQzdELElBQUksV0FBVyxDQUFDO0lBQ2hCLElBQUksV0FBVyxFQUFFO1FBQ2YsV0FBVyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMzQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxXQUFXLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTixJQUFJLFdBQVcsSUFBSSxTQUFTLEVBQUU7WUFDNUIsTUFBTSxJQUFJLGdCQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN4QztLQUNGOztRQUFNLE1BQU0sSUFBSSxnQkFBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDcEQsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQztBQWxCRCx3Q0FrQkM7QUFFRCw0Q0FBNEM7QUFDNUMsU0FBZ0IscUJBQXFCLENBQUMsV0FBNEI7SUFDaEUsNkRBQTZEO0lBQzdELE1BQU0sa0JBQWtCLEdBQ3JCLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQWUsSUFBSSxFQUFFLENBQUM7SUFDN0QsSUFBSSxXQUFXLENBQUM7SUFFaEIsV0FBVyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUMzQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFTixJQUFJLFdBQVcsSUFBSSxTQUFTLEVBQUU7UUFDNUIsTUFBTSxJQUFJLGdCQUFTLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUNsRDtJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFmRCxzREFlQyJ9
