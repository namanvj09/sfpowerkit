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
const core_1 = require("@salesforce/core");
const packageBuilder_1 = require("../../../../impl/metadata/packageBuilder");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages("sfpowerkit", "package_build");
class Build extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
      const apiversion = yield this.org.getConnection().retrieveMaxApiVersion();
      const conn = this.org.getConnection();
      const configs = new packageBuilder_1.BuildConfig(this.flags, apiversion);
      const packageXML = new packageBuilder_1.Packagexml(conn, configs);
      const result = yield packageXML.build();
      //console.log(result);
      if (!this.flags.json) {
        this.ux.log(result.toString());
      }
      return { result: packageXML.result };
    });
  }
}
exports.default = Build;
Build.description = messages.getMessage("commandDescription");
Build.examples = [
  `$ sfdx sfpowerkit:org:manifest:build --targetusername myOrg@example.com -o package.xml`,
  `$ sfdx sfpowerkit:org:manifest:build --targetusername myOrg@example.com -o package.xml -q 'ApexClass,CustomObject,Report'`,
  `$ sfdx sfpowerkit:org:manifest:build --targetusername myOrg@example.com -o package.xml -q 'ApexClass:sampleclass,CustomObject:Account'`,
];
Build.args = [{ name: "file" }];
Build.flagsConfig = {
  quickfilter: command_1.flags.string({
    char: "q",
    description: messages.getMessage("quickfilterFlagDescription"),
  }),
  excludemanaged: command_1.flags.boolean({
    char: "x",
    description: messages.getMessage("excludeManagedFlagDescription"),
  }),
  includechilds: command_1.flags.boolean({
    char: "c",
    description: messages.getMessage("includeChildsFlagDescription"),
  }),
  outputfile: command_1.flags.filepath({
    char: "o",
    description: messages.getMessage("outputFileFlagDescription"),
  }),
};
// Comment this out if your command does not require an org username
Build.requiresUsername = true;
// Comment this out if your command does not support a hub org username
Build.supportsDevhubUsername = false;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Build.requiresProject = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvbWFuaWZlc3QvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBeUQ7QUFDekQsMkNBQTRDO0FBRTVDLDZFQUdrRDtBQUVsRCx3REFBd0Q7QUFDeEQsZUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRTVDLGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsZUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFdEUsTUFBcUIsS0FBTSxTQUFRLHFCQUFXO0lBcUMvQixHQUFHOztZQUNkLHVGQUF1RjtZQUN2RixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMxRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sT0FBTyxHQUFnQixJQUFJLDRCQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRSxNQUFNLFVBQVUsR0FBZSxJQUFJLDJCQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXhDLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ2hDO1lBRUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkMsQ0FBQztLQUFBOztBQW5ESCx3QkFvREM7QUFuRGUsaUJBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFeEQsY0FBUSxHQUFHO0lBQ3ZCLHdGQUF3RjtJQUN4RiwySEFBMkg7SUFDM0gsd0lBQXdJO0NBQ3pJLENBQUM7QUFFWSxVQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRXZCLGlCQUFXLEdBQUc7SUFDN0IsV0FBVyxFQUFFLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDeEIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQztLQUMvRCxDQUFDO0lBQ0YsY0FBYyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQztLQUNsRSxDQUFDO0lBQ0YsYUFBYSxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDM0IsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQztLQUNqRSxDQUFDO0lBQ0YsVUFBVSxFQUFFLGVBQUssQ0FBQyxRQUFRLENBQUM7UUFDekIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztLQUM5RCxDQUFDO0NBQ0gsQ0FBQztBQUVGLG9FQUFvRTtBQUNuRCxzQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDekMsdUVBQXVFO0FBQ3RELDRCQUFzQixHQUFHLEtBQUssQ0FBQztBQUNoRCx1R0FBdUc7QUFDdEYscUJBQWUsR0FBRyxLQUFLLENBQUMifQ==
