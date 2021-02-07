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
const getUserDetails_1 = require("../../../utils/getUserDetails");
class PoolFetchImpl {
  constructor(hubOrg, tag, mypool, sendToUser) {
    this.hubOrg = hubOrg;
    this.tag = tag;
    this.mypool = mypool;
    this.sendToUser = sendToUser;
  }
  execute() {
    return __awaiter(this, void 0, void 0, function* () {
      yield scratchOrgUtils_1.default.checkForNewVersionCompatible(this.hubOrg);
      const results = yield scratchOrgUtils_1.default.getScratchOrgsByTag(
        this.tag,
        this.hubOrg,
        this.mypool,
        true
      );
      let emaiId;
      if (this.sendToUser) {
        try {
          emaiId = yield getUserDetails_1.getUserEmail(
            this.sendToUser,
            this.hubOrg
          );
        } catch (error) {
          sfpowerkit_1.SFPowerkit.log(
            "Unable to fetch details of the specified user, Check whether the user exists in the org ",
            core_1.LoggerLevel.ERROR
          );
          throw new core_1.SfdxError("Failed to fetch user details");
        }
      }
      let soDetail;
      if (results.records.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `${this.tag} pool has ${results.records.length} Scratch orgs available`,
          core_1.LoggerLevel.TRACE
        );
        for (let element of results.records) {
          let allocateSO = yield scratchOrgUtils_1.default.setScratchOrgInfo(
            { Id: element.Id, Allocation_status__c: "Allocate" },
            this.hubOrg
          );
          if (allocateSO === true) {
            sfpowerkit_1.SFPowerkit.log(
              `Scratch org ${element.SignupUsername} is allocated from the pool. Expiry date is ${element.ExpirationDate}`,
              core_1.LoggerLevel.TRACE
            );
            soDetail = {};
            soDetail["Id"] = element.Id;
            soDetail.orgId = element.ScratchOrg;
            soDetail.loginURL = element.LoginUrl;
            soDetail.username = element.SignupUsername;
            soDetail.password = element.Password__c;
            soDetail.expityDate = element.ExpirationDate;
            soDetail.status = "Assigned";
            break;
          } else {
            sfpowerkit_1.SFPowerkit.log(
              `Scratch org ${element.SignupUsername} allocation failed. trying to get another Scratch org from ${this.tag} pool`,
              core_1.LoggerLevel.TRACE
            );
          }
        }
      }
      if (results.records.length == 0 || !soDetail) {
        throw new core_1.SfdxError(
          `No scratch org available at the moment for ${this.tag}, try again in sometime.`
        );
      }
      if (this.sendToUser) {
        //Fetch the email for user id
        try {
          //Send an email for username
          yield scratchOrgUtils_1.default.shareScratchOrgThroughEmail(
            emaiId,
            soDetail,
            this.hubOrg
          );
        } catch (error) {
          sfpowerkit_1.SFPowerkit.log(
            "Unable to send the scratchorg details to specified user. Check whether the user exists in the org",
            core_1.LoggerLevel.ERROR
          );
        }
      }
      return soDetail;
    });
  }
}
exports.default = PoolFetchImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbEZldGNoSW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL3Bvb2wvc2NyYXRjaG9yZy9wb29sRmV0Y2hJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTJFO0FBQzNFLG9EQUFpRDtBQUNqRCxxRkFBNkU7QUFDN0Usa0VBQTZEO0FBQzdELE1BQXFCLGFBQWE7SUFNaEMsWUFDRSxNQUFXLEVBQ1gsR0FBVyxFQUNYLE1BQWUsRUFDZixVQUFrQjtRQUVsQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFWSxPQUFPOztZQUNsQixNQUFNLHlCQUFlLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSx5QkFBZSxDQUFDLG1CQUFtQixDQUN4RCxJQUFJLENBQUMsR0FBRyxFQUNSLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQ0wsQ0FBUSxDQUFDO1lBRVYsSUFBSSxNQUFNLENBQUM7WUFFWCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ25CLElBQUk7b0JBQ0YsTUFBTSxHQUFHLE1BQU0sNkJBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDM0Q7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2QsdUJBQVUsQ0FBQyxHQUFHLENBQ1osMEZBQTBGLEVBQzFGLGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO29CQUNGLE1BQU0sSUFBSSxnQkFBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7aUJBQ3JEO2FBQ0Y7WUFFRCxJQUFJLFFBQW9CLENBQUM7WUFFekIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLHVCQUFVLENBQUMsR0FBRyxDQUNaLEdBQUcsSUFBSSxDQUFDLEdBQUcsYUFBYSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0seUJBQXlCLEVBQ3ZFLGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO2dCQUVGLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtvQkFDbkMsSUFBSSxVQUFVLEdBQUcsTUFBTSx5QkFBZSxDQUFDLGlCQUFpQixDQUN0RCxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxFQUNwRCxJQUFJLENBQUMsTUFBTSxDQUNaLENBQUM7b0JBQ0YsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO3dCQUN2Qix1QkFBVSxDQUFDLEdBQUcsQ0FDWixlQUFlLE9BQU8sQ0FBQyxjQUFjLCtDQUErQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQzVHLGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO3dCQUNGLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQzVCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQzt3QkFDcEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO3dCQUNyQyxRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7d0JBQzNDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQzt3QkFDeEMsUUFBUSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO3dCQUM3QyxRQUFRLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQzt3QkFFN0IsTUFBTTtxQkFDUDt5QkFBTTt3QkFDTCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixlQUFlLE9BQU8sQ0FBQyxjQUFjLDhEQUE4RCxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQ2xILGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO3FCQUNIO2lCQUNGO2FBQ0Y7WUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDNUMsTUFBTSxJQUFJLGdCQUFTLENBQ2pCLDhDQUE4QyxJQUFJLENBQUMsR0FBRywwQkFBMEIsQ0FDakYsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNuQiw2QkFBNkI7Z0JBQzdCLElBQUk7b0JBQ0YsNEJBQTRCO29CQUM1QixNQUFNLHlCQUFlLENBQUMsMkJBQTJCLENBQy9DLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUFDO2lCQUNIO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUNkLHVCQUFVLENBQUMsR0FBRyxDQUNaLG1HQUFtRyxFQUNuRyxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztpQkFDSDthQUNGO1lBRUQsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQztLQUFBO0NBQ0Y7QUF2R0QsZ0NBdUdDIn0=
