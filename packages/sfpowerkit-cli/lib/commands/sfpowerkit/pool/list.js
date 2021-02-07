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
const poolListImpl_1 = __importDefault(
  require("../../../impl/pool/scratchorg/poolListImpl")
);
const util_1 = require("util");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_poollist"
);
class List extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.hubOrg.refreshAuth();
      const hubConn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield hubConn.retrieveMaxApiVersion());
      let listImpl = new poolListImpl_1.default(
        this.hubOrg,
        this.flags.apiversion,
        this.flags.tag,
        this.flags.mypool,
        this.flags.allscratchorgs
      );
      let result = yield listImpl.execute();
      if (!this.flags.mypool && result.length > 0) {
        result.forEach((element) => {
          delete element.password;
        });
      }
      let scratchOrgInuse = result.filter(
        (element) => element.status === "In use"
      );
      let scratchOrgNotInuse = result.filter(
        (element) => element.status === "Available"
      );
      let scratchOrgInProvision = result.filter(
        (element) => element.status === "Provisioning in progress"
      );
      if (!this.flags.json) {
        if (result.length > 0) {
          this.ux.log(`======== Scratch org Details ========`);
          if (util_1.isNullOrUndefined(this.flags.tag)) {
            this.ux.log(`List of all the pools in the org`);
            this.logTagCount(result);
            this.ux.log("===================================");
          }
          if (this.flags.allscratchorgs) {
            this.ux.log(
              `Used Scratch Orgs in the pool: ${scratchOrgInuse.length}`
            );
          }
          this.ux.log(
            `Unused Scratch Orgs in the Pool : ${scratchOrgNotInuse.length} \n`
          );
          if (
            scratchOrgInProvision.length &&
            scratchOrgInProvision.length > 0
          ) {
            this.ux.log(
              `Scratch Orgs being provisioned in the Pool : ${scratchOrgInProvision.length} \n`
            );
          }
          if (this.flags.mypool) {
            this.ux.table(result, [
              "tag",
              "orgId",
              "username",
              "password",
              "expityDate",
              "status",
              "loginURL",
            ]);
          } else {
            this.ux.table(result, [
              "tag",
              "orgId",
              "username",
              "expityDate",
              "status",
              "loginURL",
            ]);
          }
        } else {
          sfpowerkit_1.SFPowerkit.log(
            `${this.flags.tag} pool has No Scratch orgs available, time to create your pool.`,
            sfpowerkit_1.LoggerLevel.INFO
          );
        }
      }
      let output = {
        total:
          scratchOrgInuse.length +
          scratchOrgNotInuse.length +
          scratchOrgInProvision.length,
        inuse: scratchOrgInuse.length,
        unused: scratchOrgNotInuse.length,
        inprovision: scratchOrgInProvision.length,
        scratchOrgDetails: result,
      };
      return output;
    });
  }
  logTagCount(result) {
    let tagCounts = result.reduce(function (obj, v) {
      obj[v.tag] = (obj[v.tag] || 0) + 1;
      return obj;
    }, {});
    let tagArray = new Array();
    Object.keys(tagCounts).forEach(function (key) {
      tagArray.push({
        tag: key,
        count: tagCounts[key],
      });
    });
    this.ux.table(tagArray, ["tag", "count"]);
  }
}
exports.default = List;
List.description = messages.getMessage("commandDescription");
List.requiresDevhubUsername = true;
List.examples = [
  `$ sfdx sfpowerkit:pool:list -t core `,
  `$ sfdx sfpowerkit:pool:list -t core -v devhub`,
  `$ sfdx sfpowerkit:pool:list -t core -v devhub -m`,
  `$ sfdx sfpowerkit:pool:list -t core -v devhub -m -a`,
];
List.flagsConfig = {
  tag: command_1.flags.string({
    char: "t",
    description: messages.getMessage("tagDescription"),
    required: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3Bvb2wvbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUUvRCxvREFBOEQ7QUFDOUQsOEZBQXNFO0FBQ3RFLCtCQUF5QztBQUl6Qyx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1oscUJBQXFCLENBQ3RCLENBQUM7QUFFRixNQUFxQixJQUFLLFNBQVEscUJBQVc7SUFpRDlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUU1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLElBQUksUUFBUSxHQUFHLElBQUksc0JBQVksQ0FDN0IsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUMxQixDQUFDO1lB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
