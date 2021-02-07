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
const sfpowerkit_1 = require("../../../sfpowerkit");
const PoolDeleteImpl_1 = __importDefault(
  require("../../../impl/pool/scratchorg/PoolDeleteImpl")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_poolhydrate"
);
class Delete extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.hubOrg.refreshAuth();
      const hubConn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield hubConn.retrieveMaxApiVersion());
      let hydrateImpl = new PoolDeleteImpl_1.default(
        this.hubOrg,
        this.flags.apiversion,
        this.flags.tag,
        this.flags.mypool,
        this.flags.allscratchorgs,
        this.flags.inprogressonly
      );
      let result = yield hydrateImpl.execute();
      if (!this.flags.json) {
        if (result.length > 0) {
          this.ux.log(`======== Scratch org Deleted ========`);
          this.ux.table(result, ["orgId", "username"]);
        } else {
          sfpowerkit_1.SFPowerkit.log(
            `${this.flags.tag} pool has No Scratch orgs available to delete.`,
            sfpowerkit_1.LoggerLevel.INFO
          );
        }
      }
      return result;
    });
  }
}
exports.default = Delete;
Delete.description = messages.getMessage("commandDescription");
Delete.requiresDevhubUsername = true;
Delete.examples = [
  `$ sfdx sfpowerkit:pool:delete -t core `,
  `$ sfdx sfpowerkit:pool:delete -t core -v devhub`,
  `$ sfdx sfpowerkit:pool:delete -t core -v devhub -m`,
  `$ sfdx sfpowerkit:pool:delete -t core -v devhub -m -a`,
];
Delete.flagsConfig = {
  tag: command_1.flags.string({
    char: "t",
    description: messages.getMessage("tagDescription"),
    required: true,
  }),
  mypool: command_1.flags.boolean({
    char: "m",
    description: messages.getMessage("mypoolDescription"),
    required: false,
  }),
  allscratchorgs: command_1.flags.boolean({
    char: "a",
    description: messages.getMessage("allscratchorgsDescription"),
    required: false,
  }),
  inprogressonly: command_1.flags.boolean({
    char: "i",
    description: messages.getMessage("inprogressonlyDescription"),
    required: false,
    exclusive: ["allscratchorgs"],
  }),
  loglevel: command_1.flags.enum({
    description: "logging level for this command invocation",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvcG9vbC9kZWxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFFL0Qsb0RBQThEO0FBQzlELGtHQUEyRTtBQUUzRSx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osd0JBQXdCLENBQ3pCLENBQUM7QUFFRixNQUFxQixNQUFPLFNBQVEscUJBQVc7SUF1RGhDLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUU1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLElBQUksV0FBVyxHQUFHLElBQUksd0JBQWUsQ0FDbkMsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FDMUIsQ0FBQztZQUVGLElBQUksTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDcEIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQztvQkFDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQzlDO3FCQUFNO29CQUNMLHVCQUFVLENBQUMsR0FBRyxDQUNaLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGdEQUFnRCxFQUNqRSx3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztpQkFDSDthQUNGO1lBRUQsT0FBTyxNQUFpQixDQUFDO1FBQzNCLENBQUM7S0FBQTs7QUF4RkgseUJBeUZDO0FBeEZlLGtCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXJELDZCQUFzQixHQUFHLElBQUksQ0FBQztBQUVqQyxlQUFRLEdBQUc7SUFDdkIsd0NBQXdDO0lBQ3hDLGlEQUFpRDtJQUNqRCxvREFBb0Q7SUFDcEQsdURBQXVEO0NBQ3hELENBQUM7QUFFZSxrQkFBVyxHQUFHO0lBQzdCLEdBQUcsRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDbEQsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDO0lBQ0YsTUFBTSxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDcEIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQztRQUNyRCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsY0FBYyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztRQUM3RCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsY0FBYyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztRQUM3RCxRQUFRLEVBQUUsS0FBSztRQUNmLFNBQVMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCLENBQUM7SUFDRixRQUFRLEVBQUUsZUFBSyxDQUFDLElBQUksQ0FBQztRQUNuQixXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELE9BQU8sRUFBRSxNQUFNO1FBQ2YsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUU7WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTztZQUNQLE9BQU87U0FDUjtLQUNGLENBQUM7Q0FDSCxDQUFDIn0=
