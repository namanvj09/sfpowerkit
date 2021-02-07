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
const command_1 = require("@salesforce/command");
let request = require("request-promise-native");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_usage"
);
class Usage extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      let limits = yield this.getScratchOrgLimits(conn);
      this.ux.log(
        `Active Scratch Orgs Remaining: ${limits.ActiveScratchOrgs.Remaining} out of ${limits.ActiveScratchOrgs.Max}`
      );
      this.ux.log(
        `Daily Scratch Orgs Remaining: ${limits.DailyScratchOrgs.Remaining} out of ${limits.DailyScratchOrgs.Max}`
      );
      this.ux.log("");
      if (limits.ActiveScratchOrgs.Remaining !== limits.ActiveScratchOrgs.Max) {
        let scratchOrgs = yield this.getScratchOrgInfo(conn);
        //this.ux.log(scratchOrgs);
        const output = [];
        scratchOrgs.records.forEach((element) => {
          output.push({
            In_Use: element.In_Use,
            SignupEmail: element.SignupEmail,
          });
        });
        this.ux.table(output, ["In_Use", "SignupEmail"]);
      } else {
        this.ux.log(`No Scratch org used currently.`);
      }
      return 1;
    });
  }
  getScratchOrgLimits(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/limits`;
      //this.ux.log(`Query URI ${query_uri}`);
      const limits = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      return limits;
    });
  }
  getScratchOrgInfo(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        "SELECT count(id) In_Use, SignupEmail FROM ActiveScratchOrg GROUP BY SignupEmail ORDER BY count(id) DESC";
      const results = yield conn.query(query);
      return results;
    });
  }
}
exports.default = Usage;
Usage.description = messages.getMessage("commandDescription");
Usage.examples = [
  `$ sfdx sfpowerkit:org:scratchorg:usage -v devhub
    Active Scratch Orgs Remaining: 42 out of 100
    Daily Scratch Orgs Remaining: 171 out of 200

    SCRATCH_ORGS_USED  NAME
    ─────────────────  ─────────────────
    2                  XYZ@KYZ.COM
    2                  JFK@KYZ.COM
    Total number of records retrieved: 4.
  `,
];
// Comment this out if your command does not require a hub org username
Usage.requiresDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvc2NyYXRjaG9yZy91c2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUUvRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUdoRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBRTlFLE1BQXFCLEtBQU0sU0FBUSxxQkFBVztJQW1CL0IsR0FBRzs7WUFDZCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUNULGtDQUFrQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxXQUFXLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FDOUcsQ0FBQztZQUNGLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUNULGlDQUFpQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxXQUFXLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FDM0csQ0FBQztZQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhCLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUN2RSxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckQsMkJBQTJCO2dCQUMzQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUNWLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTt3QkFDdEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO3FCQUNqQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzthQUMvQztZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUFBO0lBRWEsbUJBQW1CLENBQUMsSUFBcUI7O1lBQ3JELElBQUksU0FBUyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsbUJBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxTQUFTLENBQUM7WUFFckYsd0NBQXdDO1lBRXhDLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDO2dCQUMzQixNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsU0FBUztnQkFDZCxPQUFPLEVBQUU7b0JBQ1AsYUFBYSxFQUFFLFVBQVUsSUFBSSxDQUFDLFdBQVcsRUFBRTtpQkFDNUM7Z0JBQ0QsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFDYSxpQkFBaUIsQ0FBQyxJQUFxQjs7WUFDbkQsSUFBSSxLQUFLLEdBQ1AseUdBQXlHLENBQUM7WUFFNUcsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQVEsQ0FBQztZQUVqRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQUE7O0FBN0VILHdCQThFQztBQTdFZSxpQkFBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV4RCxjQUFRLEdBQUc7SUFDdkI7Ozs7Ozs7OztHQVNEO0NBQ0EsQ0FBQztBQUVGLHVFQUF1RTtBQUN0RCw0QkFBc0IsR0FBRyxJQUFJLENBQUMifQ==
