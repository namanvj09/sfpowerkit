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
class PoolListImpl {
  constructor(hubOrg, apiversion, tag, mypool, allScratchOrgs) {
    this.hubOrg = hubOrg;
    this.apiversion = apiversion;
    this.tag = tag;
    this.mypool = mypool;
    this.allScratchOrgs = allScratchOrgs;
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
      let scratchOrgList = new Array();
      if (results.records.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `${this.tag} pool has ${results.records.length} Scratch orgs available`,
          core_1.LoggerLevel.TRACE
        );
        for (let element of results.records) {
          let soDetail = {};
          soDetail.tag = element.Pooltag__c;
          soDetail.orgId = element.ScratchOrg;
          soDetail.loginURL = element.LoginUrl;
          soDetail.username = element.SignupUsername;
          soDetail.password = element.Password__c;
          soDetail.expityDate = element.ExpirationDate;
          if (element.Allocation_status__c === "Assigned") {
            soDetail.status = "In use";
          } else if (
            (scratchOrgUtils_1.default.isNewVersionCompatible &&
              element.Allocation_status__c === "Available") ||
            (!scratchOrgUtils_1.default.isNewVersionCompatible &&
              !element.Allocation_status__c)
          ) {
            soDetail.status = "Available";
          } else {
            soDetail.status = "Provisioning in progress";
          }
          scratchOrgList.push(soDetail);
        }
      }
      return scratchOrgList;
    });
  }
}
exports.default = PoolListImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbExpc3RJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvcG9vbC9zY3JhdGNob3JnL3Bvb2xMaXN0SW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUEyRTtBQUMzRSxvREFBaUQ7QUFDakQscUZBQTZFO0FBRTdFLE1BQXFCLFlBQVk7SUFPL0IsWUFDRSxNQUFXLEVBQ1gsVUFBa0IsRUFDbEIsR0FBVyxFQUNYLE1BQWUsRUFDZixjQUF1QjtRQUV2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFWSxPQUFPOztZQUNsQixNQUFNLHlCQUFlLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSx5QkFBZSxDQUFDLG1CQUFtQixDQUN4RCxJQUFJLENBQUMsR0FBRyxFQUNSLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLE1BQU0sRUFDWCxDQUFDLElBQUksQ0FBQyxjQUFjLENBQ3JCLENBQVEsQ0FBQztZQUVWLElBQUksY0FBYyxHQUFpQixJQUFJLEtBQUssRUFBYyxDQUFDO1lBQzNELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5Qix1QkFBVSxDQUFDLEdBQUcsQ0FDWixHQUFHLElBQUksQ0FBQyxHQUFHLGFBQWEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLHlCQUF5QixFQUN2RSxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztnQkFFRixLQUFLLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7b0JBQ25DLElBQUksUUFBUSxHQUFlLEVBQUUsQ0FBQztvQkFDOUIsUUFBUSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUNsQyxRQUFRLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7b0JBQ3BDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztvQkFDckMsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO29CQUMzQyxRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7b0JBQ3hDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztvQkFDN0MsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEtBQUssVUFBVSxFQUFFO3dCQUMvQyxRQUFRLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztxQkFDNUI7eUJBQU0sSUFDTCxDQUFDLHlCQUFlLENBQUMsc0JBQXNCO3dCQUNyQyxPQUFPLENBQUMsb0JBQW9CLEtBQUssV0FBVyxDQUFDO3dCQUMvQyxDQUFDLENBQUMseUJBQWUsQ0FBQyxzQkFBc0I7NEJBQ3RDLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQ2hDO3dCQUNBLFFBQVEsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO3FCQUMvQjt5QkFBTTt3QkFDTCxRQUFRLENBQUMsTUFBTSxHQUFHLDBCQUEwQixDQUFDO3FCQUM5QztvQkFFRCxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMvQjthQUNGO1lBRUQsT0FBTyxjQUFjLENBQUM7UUFDeEIsQ0FBQztLQUFBO0NBQ0Y7QUFoRUQsK0JBZ0VDIn0=
