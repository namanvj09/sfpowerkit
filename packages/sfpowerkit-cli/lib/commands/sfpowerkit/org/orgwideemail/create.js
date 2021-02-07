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
  "orgwideemail_create"
);
class OrgWideEmail extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      this.ux.log(
        "This command is deprecated, It is no longer guaranteed to work, Please update your workflow with alternate solution"
      );
      const apiversion = yield this.org.getConnection().retrieveMaxApiVersion();
      const address = this.flags.address;
      const displayname = this.flags.displayname;
      var allprofile = this.flags.allprofile ? true : false;
      var orgWideAddressObj = {
        Address: address,
        DisplayName: displayname,
        IsAllowAllProfiles: allprofile,
      };
      this.ux.log("Creating email " + orgWideAddressObj.Address);
      let response = yield this.org.getConnection().request({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: "/services/data/v" + apiversion + "/sobjects/OrgWideEmailAddress",
        body: JSON.stringify(orgWideAddressObj),
      });
      if (response["success"]) {
        let username = this.org.getUsername();
        this.ux.log(`Org wide email created with Id ${response["id"]} `);
        this.ux.log(`Run the folowing command to verify it `);
        this.ux.log(
          `sfdx sfpowerkit:org:orgwideemail:verify -i ${response["id"]} -u ${username}`
        );
      } else {
        this.ux.error("Errors occured during org wide email creation ");
        response["errors"].forEach((error) => {
          this.ux.error(error);
        });
      }
      return response;
    });
  }
}
exports.default = OrgWideEmail;
OrgWideEmail.description = messages.getMessage(
  "orgWideEmailCreateCommandDescription"
);
OrgWideEmail.examples = [
  `sfdx sfpowerkit:org:orgwideemail:create -e testuser@test.com  -u scratch1 -n "Test Address" -p
     Creating email azlam.abdulsalam@accenture.com
     Org wide email created with Id 0D2210000004DidCAE
     Run the folowing command to verify it
    sfdx sfpowerkit:org:orgwideemail:verify -i 0D2210000004DidCAE -u test-jkomdylblorj@example.com  `,
];
OrgWideEmail.flagsConfig = {
  address: command_1.flags.email({
    char: "e",
    description: messages.getMessage("orgWideEmailAddressDescription"),
    required: true,
  }),
  displayname: command_1.flags.string({
    char: "n",
    description: messages.getMessage("orgWideEmailDisplaynameDescription"),
    required: true,
  }),
  allprofile: command_1.flags.boolean({
    char: "p",
    description: messages.getMessage("orgWideEmailAllprofileDescription"),
    required: false,
  }),
};
OrgWideEmail.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL29yZ3dpZGVlbWFpbC9jcmVhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBNEU7QUFFNUUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLHFCQUFxQixDQUN0QixDQUFDO0FBRUYsTUFBcUIsWUFBYSxTQUFRLHFCQUFXO0lBZ0N0QyxHQUFHOztZQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUNULHFIQUFxSCxDQUN0SCxDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDMUUsTUFBTSxPQUFPLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDM0MsTUFBTSxXQUFXLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDbkQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRXRELElBQUksaUJBQWlCLEdBQUc7Z0JBQ3RCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixXQUFXLEVBQUUsV0FBVztnQkFDeEIsa0JBQWtCLEVBQUUsVUFBVTthQUMvQixDQUFDO1lBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0QsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDcEQsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFO29CQUNQLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ25DO2dCQUNELEdBQUcsRUFBRSxrQkFBa0IsR0FBRyxVQUFVLEdBQUcsK0JBQStCO2dCQUN0RSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQzthQUN4QyxDQUFDLENBQUM7WUFFSCxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsa0NBQWtDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUNULDhDQUE4QyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sUUFBUSxFQUFFLENBQzlFLENBQUM7YUFDSDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO2dCQUNoRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7S0FBQTs7QUExRUgsK0JBMkVDO0FBMUVlLHdCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FDN0Msc0NBQXNDLENBQ3ZDLENBQUM7QUFFWSxxQkFBUSxHQUFHO0lBQ3ZCOzs7O3FHQUlpRztDQUNsRyxDQUFDO0FBRWUsd0JBQVcsR0FBZ0I7SUFDMUMsT0FBTyxFQUFFLGVBQUssQ0FBQyxLQUFLLENBQUM7UUFDbkIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNsRSxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7SUFDRixXQUFXLEVBQUUsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUN4QixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLG9DQUFvQyxDQUFDO1FBQ3RFLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQztJQUNGLFVBQVUsRUFBRSxlQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3hCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUM7UUFDckUsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztDQUNILENBQUM7QUFDZSw2QkFBZ0IsR0FBRyxJQUFJLENBQUMifQ==
