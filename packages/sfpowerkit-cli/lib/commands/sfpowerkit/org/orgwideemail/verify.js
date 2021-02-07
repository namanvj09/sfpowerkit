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
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "orgwideemail_verify"
);
class OrgWideEmail extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      this.ux.log(
        "This command is deprecated, It is no longer guaranteed to work, Please update your workflow with alternate solution"
      );
      const apiversion = yield this.org.getConnection().retrieveMaxApiVersion();
      const id = this.flags.emailid;
      var orgWideAddressObj = {};
      this.ux.log("Verify email " + id);
      let response = yield this.org.getConnection().request({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        url:
          "/services/data/v" +
          apiversion +
          "/sobjects/OrgWideEmailAddress/" +
          id,
        body: JSON.stringify(orgWideAddressObj),
      });
      if (response === undefined) {
        this.ux.log(`Org wide email address verified `);
      }
    });
  }
}
exports.default = OrgWideEmail;
OrgWideEmail.description = messages.getMessage(
  "orgWideEmailVerifyCommandDescription"
);
OrgWideEmail.examples = [
  `$ sfdx sfpowerkit:org:orgwideemail:verify --username scratchOrg --emailid orgwideemailid
  `,
];
OrgWideEmail.flagsConfig = {
  emailid: command_1.flags.string({
    char: "i",
    description: messages.getMessage("orgWideEmailIdDescription"),
    required: true,
  }),
};
OrgWideEmail.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL29yZ3dpZGVlbWFpbC92ZXJpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBNEU7QUFFNUUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLHFCQUFxQixDQUN0QixDQUFDO0FBRUYsTUFBcUIsWUFBYSxTQUFRLHFCQUFXO0lBb0J0QyxHQUFHOztZQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUNULHFIQUFxSCxDQUN0SCxDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDMUUsTUFBTSxFQUFFLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFFdEMsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFFM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWxDLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3BELE1BQU0sRUFBRSxPQUFPO2dCQUNmLE9BQU8sRUFBRTtvQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNuQztnQkFDRCxHQUFHLEVBQ0Qsa0JBQWtCLEdBQUcsVUFBVSxHQUFHLGdDQUFnQyxHQUFHLEVBQUU7Z0JBQ3pFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO2FBQ3hDLENBQUMsQ0FBQztZQUNILElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQzthQUNqRDtRQUNILENBQUM7S0FBQTs7QUE1Q0gsK0JBNkNDO0FBNUNlLHdCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FDN0Msc0NBQXNDLENBQ3ZDLENBQUM7QUFFWSxxQkFBUSxHQUFHO0lBQ3ZCO0dBQ0Q7Q0FDQSxDQUFDO0FBRWUsd0JBQVcsR0FBZ0I7SUFDMUMsT0FBTyxFQUFFLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDcEIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztRQUM3RCxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7Q0FDSCxDQUFDO0FBRWUsNkJBQWdCLEdBQUcsSUFBSSxDQUFDIn0=
