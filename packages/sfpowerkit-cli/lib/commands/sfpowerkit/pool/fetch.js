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
const poolFetchImpl_1 = __importDefault(
  require("../../../impl/pool/scratchorg/poolFetchImpl")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_poolFetch"
);
class Fetch extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.hubOrg.refreshAuth();
      const hubConn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield hubConn.retrieveMaxApiVersion());
      let fetchImpl = new poolFetchImpl_1.default(
        this.hubOrg,
        this.flags.tag,
        this.flags.mypool,
        this.flags.sendtouser
      );
      let result = yield fetchImpl.execute();
      if (!this.flags.json && !this.flags.sendtouser) {
        this.ux.log(`======== Scratch org details ========`);
        let list = [];
        for (let [key, value] of Object.entries(result)) {
          if (value) {
            list.push({ key: key, value: value });
          }
        }
        this.ux.table(list, ["key", "value"]);
      }
      if (!this.flags.sendtouser) return result;
      else return true;
    });
  }
}
exports.default = Fetch;
Fetch.description = messages.getMessage("commandDescription");
Fetch.requiresDevhubUsername = true;
Fetch.examples = [
  `$ sfdx sfpowerkit:pool:fetch -t core `,
  `$ sfdx sfpowerkit:pool:fetch -t core -v devhub`,
  `$ sfdx sfpowerkit:pool:fetch -t core -v devhub -m`,
  `$ sfdx sfpowerkit:pool:fetch -t core -v devhub -s testuser@test.com`,
];
Fetch.flagsConfig = {
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
  sendtouser: command_1.flags.string({
    char: "s",
    description: messages.getMessage("sendToUserDescription"),
    required: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9wb29sL2ZldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBRS9ELG9EQUE4RDtBQUM5RCxnR0FBd0U7QUFFeEUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLHNCQUFzQixDQUN2QixDQUFDO0FBRUYsTUFBcUIsS0FBTSxTQUFRLHFCQUFXO0lBaUQvQixHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztZQUVuRSxJQUFJLFNBQVMsR0FBRyxJQUFJLHVCQUFhLENBQy9CLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUN0QixDQUFDO1lBRUYsSUFBSSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Z0JBQ3JELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDL0MsSUFBSSxLQUFLLEVBQUU7d0JBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7cUJBQ3ZDO2lCQUNGO2dCQUNELElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtnQkFBRSxPQUFPLE1BQWlCLENBQUM7O2dCQUNoRCxPQUFPLElBQUksQ0FBQztRQUNuQixDQUFDO0tBQUE7O0FBaEZILHdCQWlGQztBQWhGZSxpQkFBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUVyRCw0QkFBc0IsR0FBRyxJQUFJLENBQUM7QUFFakMsY0FBUSxHQUFHO0lBQ3ZCLHVDQUF1QztJQUN2QyxnREFBZ0Q7SUFDaEQsbURBQW1EO0lBQ25ELHFFQUFxRTtDQUN0RSxDQUFDO0FBRWUsaUJBQVcsR0FBRztJQUM3QixHQUFHLEVBQUUsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUNoQixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ2xELFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQztJQUNGLE1BQU0sRUFBRSxlQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3BCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7UUFDckQsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUNGLFVBQVUsRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUM7UUFDekQsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUNGLFFBQVEsRUFBRSxlQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsRUFBRSwyQ0FBMkM7UUFDeEQsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRTtZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0YsQ0FBQztDQUNILENBQUMifQ==
