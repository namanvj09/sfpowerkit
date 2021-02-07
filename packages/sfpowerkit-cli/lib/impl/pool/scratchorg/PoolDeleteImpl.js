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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../sfpowerkit");
const scratchOrgUtils_1 = __importDefault(
  require("../../../utils/scratchOrgUtils")
);
class PoolDeleteImpl {
  constructor(hubOrg, apiversion, tag, mypool, allScratchOrgs, inprogressonly) {
    this.hubOrg = hubOrg;
    this.apiversion = apiversion;
    this.tag = tag;
    this.mypool = mypool;
    this.allScratchOrgs = allScratchOrgs;
    this.inprogressonly = inprogressonly;
  }
  execute() {
    return __awaiter(this, void 0, void 0, function* () {
      yield scratchOrgUtils_1.default.checkForNewVersionCompatible(this.hubOrg);
      const results = yield scratchOrgUtils_1.default.getScratchOrgsByTag(
        this.tag,
        this.hubOrg,
        this.mypool,
        !this.allScratchOrgs
      );
      let scratchOrgToDelete = new Array();
      if (results.records.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `${this.tag} pool has ${results.records.length} Scratch orgs.`,
          core_1.LoggerLevel.TRACE
        );
        let scrathOrgIds = [];
        for (let element of results.records) {
          if (
            !this.inprogressonly ||
            element.Allocation_status__c === "In Progress"
          ) {
            let soDetail = {};
            soDetail.orgId = element.ScratchOrg;
            soDetail.loginURL = element.LoginUrl;
            soDetail.username = element.SignupUsername;
            soDetail.expityDate = element.ExpirationDate;
            soDetail.status = "Deleted";
            scratchOrgToDelete.push(soDetail);
            scrathOrgIds.push(`'${element.Id}'`);
          }
        }
        if (scrathOrgIds.length > 0) {
          let activeScrathOrgs = yield scratchOrgUtils_1.default.getActiveScratchOrgsByInfoId(
            this.hubOrg,
            scrathOrgIds.join(",")
          );
          if (activeScrathOrgs.records.length > 0) {
            let scratchOrgIds = activeScrathOrgs.records.map((elem) => elem.Id);
            yield scratchOrgUtils_1.default.deleteScratchOrg(
              this.hubOrg,
              scratchOrgIds
            );
            sfpowerkit_1.SFPowerkit.log(
              "Scratch Org(s) deleted successfully.",
              core_1.LoggerLevel.TRACE
            );
          }
        }
      }
      return scratchOrgToDelete;
    });
  }
}
exports.default = PoolDeleteImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbERlbGV0ZUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wb29sL3NjcmF0Y2hvcmcvUG9vbERlbGV0ZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBMkU7QUFDM0Usb0RBQWlEO0FBQ2pELHFGQUE2RTtBQUM3RSxNQUFxQixjQUFjO0lBUWpDLFlBQ0UsTUFBVyxFQUNYLFVBQWtCLEVBQ2xCLEdBQVcsRUFDWCxNQUFlLEVBQ2YsY0FBdUIsRUFDdkIsY0FBdUI7UUFFdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN2QyxDQUFDO0lBRVksT0FBTzs7WUFDbEIsTUFBTSx5QkFBZSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRSxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0seUJBQWUsQ0FBQyxtQkFBbUIsQ0FDeEQsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxNQUFNLEVBQ1gsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUNyQixDQUFRLENBQUM7WUFFVixJQUFJLGtCQUFrQixHQUFpQixJQUFJLEtBQUssRUFBYyxDQUFDO1lBQy9ELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5Qix1QkFBVSxDQUFDLEdBQUcsQ0FDWixHQUFHLElBQUksQ0FBQyxHQUFHLGFBQWEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLGdCQUFnQixFQUM5RCxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztnQkFFRixJQUFJLFlBQVksR0FBYSxFQUFFLENBQUM7Z0JBRWhDLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtvQkFDbkMsSUFDRSxDQUFDLElBQUksQ0FBQyxjQUFjO3dCQUNwQixPQUFPLENBQUMsb0JBQW9CLEtBQUssYUFBYSxFQUM5Qzt3QkFDQSxJQUFJLFFBQVEsR0FBZSxFQUFFLENBQUM7d0JBQzlCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQzt3QkFDcEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO3dCQUNyQyxRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7d0JBQzNDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQzt3QkFDN0MsUUFBUSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7d0JBRTVCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDbEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUN0QztpQkFDRjtnQkFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMzQixJQUFJLGdCQUFnQixHQUFHLE1BQU0seUJBQWUsQ0FBQyw0QkFBNEIsQ0FDdkUsSUFBSSxDQUFDLE1BQU0sRUFDWCxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixDQUFDO29CQUVGLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3ZDLElBQUksYUFBYSxHQUFhLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQ3hELENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUNsQixDQUFDO3dCQUNGLE1BQU0seUJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUNuRSx1QkFBVSxDQUFDLEdBQUcsQ0FDWixzQ0FBc0MsRUFDdEMsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDNUIsQ0FBQztLQUFBO0NBQ0Y7QUFoRkQsaUNBZ0ZDIn0=
