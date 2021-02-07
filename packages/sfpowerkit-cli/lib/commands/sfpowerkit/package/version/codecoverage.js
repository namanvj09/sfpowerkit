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
const sfpowerkit_1 = require("../../../../sfpowerkit");
const packageVersionCoverage_1 = __importDefault(
  require("../../../../impl/package/version/packageVersionCoverage")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "package_codecoverage"
);
class CodeCoverage extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.hubOrg.refreshAuth();
      const conn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      let versionId = [];
      if (this.flags.versionid) {
        versionId = this.flags.versionid;
      }
      let versionNumber;
      if (this.flags.versionnumber) {
        versionNumber = this.flags.versionnumber;
      }
      let packageName;
      if (this.flags.package) {
        packageName = this.flags.package;
      }
      let packageVersionCoverageImpl = new packageVersionCoverage_1.default();
      const result = yield packageVersionCoverageImpl.getCoverage(
        versionId,
        versionNumber,
        packageName,
        conn
      );
      this.ux.table(result, [
        "packageName",
        "packageId",
        "packageVersionNumber",
        "packageVersionId",
        "coverage",
        "HasPassedCodeCoverageCheck",
      ]);
      return result;
    });
  }
}
exports.default = CodeCoverage;
CodeCoverage.description = messages.getMessage("commandDescription");
CodeCoverage.examples = [
  `$ sfdx sfpowerkit:package:version:codecoverage -v myOrg@example.com -i 04tXXXXXXXXXXXXXXX \n`,
  `$ sfdx sfpowerkit:package:version:codecoverage -v myOrg@example.com -i 04tXXXXXXXXXXXXXXX,04tXXXXXXXXXXXXXXX,04tXXXXXXXXXXXXXXX \n`,
  `$ sfdx sfpowerkit:package:version:codecoverage -v myOrg@example.com -p core -n 1.2.0.45 \n`,
  `$ sfdx sfpowerkit:package:version:codecoverage -v myOrg@example.com -p 0HoXXXXXXXXXXXXXXX -n 1.2.0.45`,
];
CodeCoverage.flagsConfig = {
  package: command_1.flags.string({
    required: false,
    char: "p",
    description: messages.getMessage("packageName"),
  }),
  versionnumber: command_1.flags.string({
    required: false,
    char: "n",
    description: messages.getMessage("packageVersionNumber"),
  }),
  versionid: command_1.flags.array({
    required: false,
    char: "i",
    description: messages.getMessage("packageVersionId"),
  }),
  apiversion: command_1.flags.builtin({
    description: messages.getMessage("apiversion"),
  }),
  loglevel: command_1.flags.enum({
    description: messages.getMessage("loglevel"),
    default: "info",
    required: false,
    options: [
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
      "TRACE",
      "DEBUG",
      "INFO",
      "WARN",
      "ERROR",
      "FATAL",
    ],
  }),
};
// Comment this out if your command does not require an org username
CodeCoverage.requiresDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWNvdmVyYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvcGFja2FnZS92ZXJzaW9uL2NvZGVjb3ZlcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUUvRCx1REFBb0Q7QUFFcEQscUhBQTZGO0FBQzdGLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWixzQkFBc0IsQ0FDdkIsQ0FBQztBQUVGLE1BQXFCLFlBQWEsU0FBUSxxQkFBVztJQW9EdEMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7Z0JBQ3hCLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQzthQUNsQztZQUNELElBQUksYUFBYSxDQUFDO1lBQ2xCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7Z0JBQzVCLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQzthQUMxQztZQUNELElBQUksV0FBVyxDQUFDO1lBQ2hCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RCLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELElBQUksMEJBQTBCLEdBQTJCLElBQUksZ0NBQXNCLEVBQUUsQ0FBQztZQUV0RixNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sMEJBQTBCLENBQUMsV0FBVyxDQUMxRCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDWCxJQUFJLENBQ0wsQ0FBUSxDQUFDO1lBRVYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNwQixhQUFhO2dCQUNiLFdBQVc7Z0JBQ1gsc0JBQXNCO2dCQUN0QixrQkFBa0I7Z0JBQ2xCLFVBQVU7Z0JBQ1YsNEJBQTRCO2FBQzdCLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTs7QUE3RkgsK0JBOEZDO0FBN0ZlLHdCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXhELHFCQUFRLEdBQUc7SUFDdkIsOEZBQThGO0lBQzlGLG9JQUFvSTtJQUNwSSw0RkFBNEY7SUFDNUYsdUdBQXVHO0NBQ3hHLENBQUM7QUFFZSx3QkFBVyxHQUFHO0lBQzdCLE9BQU8sRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3BCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7S0FDaEQsQ0FBQztJQUNGLGFBQWEsRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQztLQUN6RCxDQUFDO0lBQ0YsU0FBUyxFQUFFLGVBQUssQ0FBQyxLQUFLLENBQUM7UUFDckIsUUFBUSxFQUFFLEtBQUs7UUFDZixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO0tBQ3JELENBQUM7SUFDRixVQUFVLEVBQUUsZUFBSyxDQUFDLE9BQU8sQ0FBQztRQUN4QixXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7S0FDL0MsQ0FBQztJQUNGLFFBQVEsRUFBRSxlQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1I7S0FDRixDQUFDO0NBQ0gsQ0FBQztBQUVGLG9FQUFvRTtBQUNuRCxtQ0FBc0IsR0FBRyxJQUFJLENBQUMifQ==
