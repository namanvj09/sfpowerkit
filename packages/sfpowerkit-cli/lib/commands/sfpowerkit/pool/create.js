"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const rimraf = __importStar(require("rimraf"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const poolCreateImpl_1 = __importDefault(
  require("../../../impl/pool/scratchorg/poolCreateImpl")
);
const core_1 = require("@salesforce/core");
const GetNodeWrapper_1 = require("../../../sfdxnode/GetNodeWrapper");
const parallel_1 = require("../../../sfdxnode/parallel");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "scratchorg_pool_create"
);
class Create extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.hubOrg.refreshAuth();
      const hubConn = this.hubOrg.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield hubConn.retrieveMaxApiVersion());
      GetNodeWrapper_1.loadSFDX();
      let scratchOrgPoolImpl = new poolCreateImpl_1.default(
        this.flags.configfilepath,
        this.hubOrg,
        this.flags.apiversion,
        parallel_1.sfdx,
        this.flags.batchsize
      );
      try {
        return !(yield scratchOrgPoolImpl.poolScratchOrgs());
      } catch (err) {
        throw new core_1.SfdxError("Unable to execute command .. " + err);
      }
    });
  }
}
exports.default = Create;
Create.description = messages.getMessage("commandDescription");
Create.requiresDevhubUsername = true;
Create.examples = [
  `$ sfdx sfpowerkit:pool:create -f config\\core_poolconfig.json`,
  `$ sfdx sfpowerkit:pool:create -f config\\core_poolconfig.json -v devhub`,
];
Create.flagsConfig = {
  configfilepath: command_1.flags.filepath({
    char: "f",
    description: messages.getMessage("configFilePathDescription"),
    required: true,
  }),
  batchsize: command_1.flags.number({
    char: "b",
    default: 10,
    description: messages.getMessage("batchSizeDescription"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvcG9vbC9jcmVhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTRFO0FBRTVFLCtDQUFpQztBQUNqQyxvREFBaUQ7QUFDakQsa0dBQTBFO0FBQzFFLDJDQUE2QztBQUM3QyxxRUFBNEQ7QUFDNUQseURBQWtEO0FBRWxELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix3QkFBd0IsQ0FDekIsQ0FBQztBQUVGLE1BQXFCLE1BQU8sU0FBUSxxQkFBVztJQTBDaEMsR0FBRzs7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUU1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLHlCQUFRLEVBQUUsQ0FBQztZQUVYLElBQUksa0JBQWtCLEdBQUcsSUFBSSx3QkFBYyxDQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFDekIsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFDckIsZUFBSSxFQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUNyQixDQUFDO1lBRUYsSUFBSTtnQkFDRixPQUFPLENBQUMsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7YUFDdEQ7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixNQUFNLElBQUksZ0JBQVMsQ0FBQywrQkFBK0IsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUM1RDtRQUNILENBQUM7S0FBQTs7QUFuRUgseUJBb0VDO0FBbkVlLGtCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3JELDZCQUFzQixHQUFHLElBQUksQ0FBQztBQUVqQyxlQUFRLEdBQUc7SUFDdkIsK0RBQStEO0lBQy9ELHlFQUF5RTtDQUMxRSxDQUFDO0FBRWUsa0JBQVcsR0FBZ0I7SUFDMUMsY0FBYyxFQUFFLGVBQUssQ0FBQyxRQUFRLENBQUM7UUFDN0IsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztRQUM3RCxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7SUFDRixTQUFTLEVBQUUsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUN0QixJQUFJLEVBQUUsR0FBRztRQUNULE9BQU8sRUFBRSxFQUFFO1FBQ1gsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDeEQsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUNGLFFBQVEsRUFBRSxlQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsRUFBRSwyQ0FBMkM7UUFDeEQsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRTtZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0YsQ0FBQztDQUNILENBQUMifQ==
