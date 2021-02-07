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
  "sandbox_create"
);
class Create extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel("INFO", false);
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      const uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/sobjects/SandboxInfo/`;
      var result;
      if (this.flags.clonefrom) {
        const sourceSandboxId = yield this.getSandboxId(
          conn,
          this.flags.clonefrom
        );
        result = yield request({
          method: "post",
          uri,
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
          },
          body: {
            AutoActivate: "true",
            SandboxName: `${this.flags.name}`,
            Description: `${this.flags.description}`,
            ApexClassId: `${this.flags.apexclass}`,
            SourceId: sourceSandboxId,
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
          method: "post",
          uri,
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
          },
          body: {
            AutoActivate: "true",
            SandboxName: `${this.flags.name}`,
            Description: `${this.flags.description}`,
            LicenseType: `${this.flags.licensetype}`,
            ApexClassId: `${this.flags.apexclass}`,
          },
          json: true,
        });
      }
      if (result.success) {
        sfpowerkit_1.SFPowerkit.log(
          `Successfully Enqueued Creation of Sandbox`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        if (!this.flags.json) this.ux.logJson(result);
      } else {
        throw new core_1.SfdxError("Unable to Create sandbox");
      }
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
      sfpowerkit_1.SFPowerkit.log(
        `Fetched Sandbox Id for sandbox  ${name}  is ${sandbox_query_result.records[0].Id}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      return sandbox_query_result.records[0].Id;
    });
  }
}
exports.default = Create;
Create.description = messages.getMessage("commandDescription");
Create.examples = [
  `$ sfdx sfpowerkit:org:sandbox:create -d Testsandbox -f sitSandbox -n test2 -v myOrg@example.com`,
  `$ sfdx sfpowerkit:org:sandbox:create -d Testsandbox -l DEVELOPER -n test2 -v myOrg@example.com`,
];
Create.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
  }),
  description: command_1.flags.string({
    required: true,
    char: "d",
    description: messages.getMessage("descriptionFlagDescription"),
  }),
  licensetype: command_1.flags.string({
    required: true,
    char: "l",
    options: ["DEVELOPER", "DEVELOPER_PRO", "PARTIAL", "FULL"],
    description: messages.getMessage("licenseFlagDescription"),
  }),
  apexclass: command_1.flags.string({
    required: false,
    char: "a",
    default: "",
    description: messages.getMessage("apexClassFlagDescription"),
  }),
  clonefrom: command_1.flags.string({
    required: false,
    char: "f",
    default: "",
    description: messages.getMessage("cloneFromFlagDescripton"),
  }),
};
// Comment this out if your command does not require a hub org username
Create.requiresDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL3NhbmRib3gvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBRS9ELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2hELDJDQUE2QztBQUM3Qyx1REFBaUU7QUFFakUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUU1RSxNQUFxQixNQUFPLFNBQVEscUJBQVc7SUEwQ2hDLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXRDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7WUFFaEUsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxtQkFBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLGdDQUFnQyxDQUFDO1lBRXhHLElBQUksTUFBTSxDQUFDO1lBRVgsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMs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
