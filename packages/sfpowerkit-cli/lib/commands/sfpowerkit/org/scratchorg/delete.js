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
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const scratchOrgUtils_1 = __importDefault(
  require("../../../../utils/scratchOrgUtils")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_delete"
);
class Delete extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.flags.username && !this.flags.email) {
        throw new core_1.SfdxError(
          "Required flags are missing, Please provide either username or email."
        );
      }
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      let info = yield this.getActiveScratchOrgsForUser(
        conn,
        this.flags.email,
        this.flags.username
      );
      if (info.totalSize > 0) {
        this.ux.log(
          `Found ${info.totalSize} Scratch Org(s) for the given ${
            this.flags.username
              ? "Username: " + this.flags.username
              : "Email: " + this.flags.email
          } in devhub ${this.hubOrg.getUsername()}.\n`
        );
        this.ux.table(info.records, [
          "Id",
          "SignupUsername",
          "SignupEmail",
          "ExpirationDate",
        ]);
        let scratchOrgIds = info.records.map((elem) => elem.Id);
        yield scratchOrgUtils_1.default.deleteScratchOrg(
          this.hubOrg,
          scratchOrgIds
        );
        this.ux.log("Scratch Org(s) deleted successfully.");
      } else {
        this.ux.log(
          `No Scratch Org(s) found for the given ${
            this.flags.username
              ? "Username: " + this.flags.username
              : "Email: " + this.flags.email
          } in devhub ${this.hubOrg.getUsername()}.`
        );
      }
      return 1;
    });
  }
  getActiveScratchOrgsForUser(conn, email, username) {
    return __awaiter(this, void 0, void 0, function* () {
      let query = `SELECT Id, SignupUsername, SignupEmail, ExpirationDate FROM ActiveScratchOrg`;
      if (username) {
        query = `${query} WHERE SignupUsername = '${username}'`;
      } else {
        query = `${query} WHERE SignupEmail = '${email}'`;
      }
      const scratch_orgs = yield conn.query(query);
      return scratch_orgs;
    });
  }
}
exports.default = Delete;
Delete.description = messages.getMessage("commandDescription");
Delete.examples = [
  `$ sfdx sfpowerkit:org:scratchorg:delete  -e xyz@kyz.com -v devhub`,
  `$ sfdx sfpowerkit:org:scratchorg:delete  -u xyz@kyz.com -v devhub`,
];
// Comment this out if your command does not require a hub org username
Delete.requiresDevhubUsername = true;
Delete.flagsConfig = {
  email: command_1.flags.string({
    required: false,
    char: "e",
    exclusive: ["username"],
    description: messages.getMessage("emailFlagDescription"),
  }),
  username: command_1.flags.string({
    required: false,
    char: "u",
    exclusive: ["email"],
    description: messages.getMessage("usernameFlagDescription"),
  }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL3NjcmF0Y2hvcmcvZGVsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBQy9ELDJDQUE2QztBQUU3Qyx3RkFBZ0U7QUFDaEUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUUvRSxNQUFxQixNQUFPLFNBQVEscUJBQVc7SUEwQmhDLEdBQUc7O1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQzdDLE1BQU0sSUFBSSxnQkFBUyxDQUNqQixzRUFBc0UsQ0FDdkUsQ0FBQzthQUNIO1lBRUQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztZQUVoRSxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FDL0MsSUFBSSxFQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FDcEIsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFD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
