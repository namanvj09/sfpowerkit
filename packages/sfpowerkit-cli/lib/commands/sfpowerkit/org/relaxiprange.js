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
const relaxIPRangeImpl_1 = __importDefault(
  require("../../../impl/org/relaxIPRangeImpl")
);
// tslint:disable-next-line:ordered-imports
var path = require("path");
const sfpowerkit_1 = require("../../../sfpowerkit");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "org_relaxiprange"
);
class Relaxiprange extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      //validate only one param is passed
      if (!this.flags.range && !this.flags.all && !this.flags.none) {
        throw new core_1.SfdxError(
          `Required input is missing. you must pass anyone of the flag -r (or) --all (or) --none`
        );
      } else if (
        (this.flags.range && this.flags.all) ||
        (this.flags.range && this.flags.none) ||
        (this.flags.none && this.flags.all)
      ) {
        throw new core_1.SfdxError(
          `Too many inputs found, you must pass only one param -r (or) --all (or) --none`
        );
      }
      let ipRangeToSet = [];
      if (this.flags.range) {
        ipRangeToSet = this.flags.range.map(function (element) {
          let range = element.split("-");
          return { start: range[0], end: range[1] };
        });
      }
      return yield relaxIPRangeImpl_1.default.setIp(
        this.org.getConnection(),
        this.org.getUsername(),
        ipRangeToSet,
        this.flags.all,
        this.flags.none
      );
    });
  }
}
exports.default = Relaxiprange;
Relaxiprange.description = messages.getMessage("commandDescription");
Relaxiprange.examples = [
  `sfdx sfpowerkit:org:relaxiprange -u sandbox -r "122.0.0.0-122.255.255.255,49.0.0.0-49.255.255.255"`,
  `sfdx sfpowerkit:org:relaxiprange -u sandbox --all`,
  `sfdx sfpowerkit:org:relaxiprange -u sandbox --none`,
];
Relaxiprange.flagsConfig = {
  range: command_1.flags.array({
    required: false,
    char: "r",
    description: messages.getMessage("rangeFlagDescription"),
  }),
  all: command_1.flags.boolean({
    description: messages.getMessage("allDescription"),
    required: false,
  }),
  none: command_1.flags.boolean({
    description: messages.getMessage("noneDescription"),
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
// Comment this out if your command does not require an org username
Relaxiprange.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXhpcHJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL3JlbGF4aXByYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUErRDtBQUMvRCwyQ0FBNkM7QUFDN0MsMEZBQWtFO0FBRWxFLDJDQUEyQztBQUMzQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0Isb0RBQThEO0FBRTlELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFOUUsTUFBcUIsWUFBYSxTQUFRLHFCQUFXO0lBZ0R0QyxHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsbUNBQW1DO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQzVELE1BQU0sSUFBSSxnQkFBUyxDQUNqQix1RkFBdUYsQ0FDeEYsQ0FBQzthQUNIO2lCQUFNLElBQ0wsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDcEMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDckMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNuQztnQkFDQSxNQUFNLElBQUksZ0JBQVMsQ0FDakIsK0VBQStFLENBQ2hGLENBQUM7YUFDSDtZQUVELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNwQixZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVMsT0FBZTtvQkFDMUQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsT0FBTyxNQUFNLDBCQUFnQixDQUFDLEtBQUssQ0FDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFDdEIsWUFBWSxFQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUNoQixDQUFDO1FBQ0osQ0FBQztLQUFBOztBQWpGSCwrQkFrRkM7QUFoRmUsd0JBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFeEQscUJBQVEsR0FBRztJQUN2QixvR0FBb0c7SUFDcEcsbURBQW1EO0lBQ25ELG9EQUFvRDtDQUNyRCxDQUFDO0FBRWUsd0JBQVcsR0FBRztJQUM3QixLQUFLLEVBQUUsZUFBSyxDQUFDLEtBQUssQ0FBQztRQUNqQixRQUFRLEVBQUUsS0FBSztRQUNmLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUM7S0FDekQsQ0FBQztJQUNGLEdBQUcsRUFBRSxlQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pCLFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ2xELFFBQVEsRUFBRSxLQUFLO0tBQ2hCLENBQUM7SUFDRixJQUFJLEVBQUUsZUFBSyxDQUFDLE9BQU8sQ0FBQztRQUNsQixXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUNuRCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsUUFBUSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkIsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1I7S0FDRixDQUFDO0NBQ0gsQ0FBQztBQUVGLG9FQUFvRTtBQUNuRCw2QkFBZ0IsR0FBRyxJQUFJLENBQUMifQ==
