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
const PackageInfo_1 = __importDefault(
  require("@dxatscale/sfpowerkit.core/lib/package/version/PackageInfo")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "package_info"
);
class Info extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      let packageInfoImpl = new PackageInfo_1.default(
        conn,
        this.flags.apiversion
      );
      let result = yield packageInfoImpl.getPackages();
      result.sort((a, b) => (a.packageName > b.packageName ? 1 : -1));
      if (this.hubOrg) {
        result = yield packageInfoImpl.getPackagesDetailsfromDevHub(
          this.hubOrg.getConnection(),
          result
        );
      }
      this.ux.table(result, [
        "packageName",
        "type",
        "IsOrgDependent",
        "packageNamespacePrefix",
        "packageVersionNumber",
        "packageVersionId",
        "allowedLicenses",
        "usedLicenses",
        "expirationDate",
        "status",
        "CodeCoverage",
        "codeCoverageCheckPassed",
        "validationSkipped",
      ]);
      return result;
    });
  }
}
exports.default = Info;
Info.description = messages.getMessage("commandDescription");
Info.examples = [
  `$ sfdx sfpowerkit:package:version:info -u myOrg@example.com `,
];
Info.flagsConfig = {
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
Info.requiresUsername = true;
Info.supportsDevhubUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3BhY2thZ2UvdmVyc2lvbi9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBRS9ELHVEQUFvRDtBQUNwRCw2R0FBb0Y7QUFFcEYsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFMUUsTUFBcUIsSUFBSyxTQUFRLHFCQUFXO0lBbUM5QixHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztZQUVoRSxJQUFJLGVBQWUsR0FBZ0IsSUFBSSxxQkFBVyxDQUNoRCxJQUFJLEVBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQ3RCLENBQUM7WUFFRixJQUFJLE1BQU0sR0FBRyxDQUFDLE1BQU0sZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFRLENBQUM7WUFFMUQsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2YsTUFBTSxHQUFHLENBQUMsTUFBTSxlQUFlLENBQUMsNEJBQTRCLENBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQzNCLE1BQU0sQ0FDUCxDQUFRLENBQUM7YUFDWDtZQUVELElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsYUFBYTtnQkFDYixNQUFNO2dCQUNOLGdCQUFnQjtnQkFDaEIsd0JBQXdCO2dCQUN4QixzQkFBc0I7Z0JBQ3RCLGtCQUFrQjtnQkFDbEIsaUJBQWlCO2dCQUNqQixjQUFjO2dCQUNkLGdCQUFnQjtnQkFDaEIsUUFBUTtnQkFDUixjQUFjO2dCQUNkLHlCQUF5QjtnQkFDekIsbUJBQW1CO2FBQ3BCLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTs7QUE3RUgsdUJBOEVDO0FBN0VlLGdCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXhELGFBQVEsR0FBRztJQUN2Qiw4REFBOEQ7Q0FDL0QsQ0FBQztBQUVlLGdCQUFXLEdBQUc7SUFDN0IsVUFBVSxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDeEIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO0tBQy9DLENBQUM7SUFDRixRQUFRLEVBQUUsZUFBSyxDQUFDLElBQUksQ0FBQztRQUNuQixXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDNUMsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRTtZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0YsQ0FBQztDQUNILENBQUM7QUFFRixvRUFBb0U7QUFDbkQscUJBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLDJCQUFzQixHQUFHLElBQUksQ0FBQyJ9
