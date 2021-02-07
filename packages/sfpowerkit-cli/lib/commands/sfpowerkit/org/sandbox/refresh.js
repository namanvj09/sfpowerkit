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
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../../sfpowerkit");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "sandbox_refresh"
);
class Refresh extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel("INFO", false);
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      var result;
      const sandboxId = yield this.getSandboxId(conn, this.flags.name);
      const uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/sobjects/SandboxInfo/${sandboxId}/`;
      if (this.flags.clonefrom) {
        const sourceSandboxId = yield this.getSandboxId(
          conn,
          this.flags.clonefrom
        );
        result = yield request({
          method: "patch",
          url: uri,
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
          },
          body: {
            AutoActivate: "true",
            SourceId: `${sourceSandboxId}`,
          },
          json: true,
        });
      } else {
        if (!this.flags.licensetype) {
          throw new core_1.SfdxError(
            "License type is required when clonefrom source org is not provided. you may need to provide -l | --licensetype"
          );
        }
        result = yield request({
          method: "patch",
          url: uri,
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
          },
          body: {
            AutoActivate: "true",
            LicenseType: `${this.flags.licensetype}`,
          },
          json: true,
        });
      }
      sfpowerkit_1.SFPowerkit.log(
        `Successfully Enqueued Refresh of Sandbox`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      return result;
    });
  }
  getSandboxId(conn, name) {
    return __awaiter(this, void 0, void 0, function* () {
      const query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=SELECT+Id,SandboxName+FROM+SandboxInfo+WHERE+SandboxName+in+('${name}')`;
      const sandbox_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      if (sandbox_query_result.records[0] == undefined)
        throw new core_1.SfdxError(
          `Unable to continue, Please check your sandbox name: ${name}`
        );
      this.ux.log();
      sfpowerkit_1.SFPowerkit.log(
        `Fetched Sandbox Id for sandbox  ${name}  is ${sandbox_query_result.records[0].Id}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      return sandbox_query_result.records[0].Id;
    });
  }
}
exports.default = Refresh;
Refresh.description = messages.getMessage("commandDescription");
Refresh.examples = [
  `$ sfdx sfpowerkit:org:sandbox:refresh -n test2 -f sitSandbox -v myOrg@example.com`,
  `$ sfdx sfpowerkit:org:sandbox:refresh -n test2 -l DEVELOPER -v myOrg@example.com`,
];
Refresh.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
  }),
  clonefrom: command_1.flags.string({
    required: false,
    char: "f",
    default: "",
    description: messages.getMessage("cloneFromFlagDescripton"),
  }),
  licensetype: command_1.flags.string({
    required: false,
    char: "l",
    options: ["DEVELOPER", "DEVELOPER_PRO", "PARTIAL", "FULL"],
    description: messages.getMessage("licenseFlagDescription"),
  }),
};
// Comment this out if your command does not require a hub org username
Refresh.requiresDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L29yZy9zYW5kYm94L3JlZnJlc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFFL0QsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDaEQsMkNBQTZDO0FBQzdDLHVEQUFpRTtBQUVqRSx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRTdFLE1BQXFCLE9BQVEsU0FBUSxxQkFBVztJQStCakMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRWhDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztZQUVoRSxJQUFJLE1BQU0sQ0FBQztZQUVYLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRSxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLG1CQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLFVB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
