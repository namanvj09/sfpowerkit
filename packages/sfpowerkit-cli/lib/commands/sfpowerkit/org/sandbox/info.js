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
  "sandbox_info"
);
class Info extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel("INFO", false);
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      var result = yield this.getSandboxInfo(conn, this.flags.name);
      sfpowerkit_1.SFPowerkit.log(
        `Successfully Retrieved Sandbox Details`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      if (!this.flags.json) this.ux.logJson(result);
      return result;
    });
  }
  getSandboxInfo(conn, name) {
    return __awaiter(this, void 0, void 0, function* () {
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=SELECT+Id,SandboxName+FROM+SandboxProcess+WHERE+SandboxName+in+('${name}')+ORDER+BY+EndDate+DESC`;
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
          `Unable to find a sandbox with name: ${name}`
        );
      var result = yield this.processSandboxInfo(
        sandbox_query_result.records,
        conn,
        this.flags.showonlylatest
      );
      return result;
    });
  }
  processSandboxInfo(sandboxRecords, conn, isShowOnlyLatest) {
    return __awaiter(this, void 0, void 0, function* () {
      var result = [];
      for (const item of sandboxRecords) {
        var output = yield this.getDetailedSandboxInfo(
          item.attributes.url,
          conn
        );
        result.push(output);
        if (isShowOnlyLatest) break;
      }
      return result;
    });
  }
  getDetailedSandboxInfo(sandboxInfoUl, conn) {
    return __awaiter(this, void 0, void 0, function* () {
      const query_uri = `${conn.instanceUrl}${sandboxInfoUl}`;
      const sandbox_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      return sandbox_query_result;
    });
  }
}
exports.default = Info;
Info.description = messages.getMessage("commandDescription");
Info.examples = [
  `$ sfdx sfpowerkit:org:sandbox:info -n test2  -v produser@example.com 
  Successfully Enqueued Refresh of Sandbox
  `,
];
Info.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
  }),
  showonlylatest: command_1.flags.boolean({
    required: false,
    char: "s",
    default: false,
    description: messages.getMessage("showOnlyLatestFlagDescription"),
  }),
};
// Comment this out if your command does not require a hub org username
Info.requiresDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L29yZy9zYW5kYm94L2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBdUU7QUFFdkUsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDaEQsMkNBQTZDO0FBQzdDLHVEQUFpRTtBQUVqRSx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUUxRSxNQUFxQixJQUFLLFNBQVEscUJBQVc7SUEwQjlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlELHVCQUFVLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLHdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENB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
