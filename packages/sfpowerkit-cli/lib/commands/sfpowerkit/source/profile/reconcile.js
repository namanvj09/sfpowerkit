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
const core_1 = require("@salesforce/core");
const _ = __importStar(require("lodash"));
const sfpowerkit_1 = require("../../../../sfpowerkit");
const metadataInfo_1 = require("../../../../impl/metadata/metadataInfo");
const path = __importStar(require("path"));
const profileReconcile_1 = __importDefault(
  require("../../../../impl/source/profiles/profileReconcile")
);
const metadataFiles_1 = __importDefault(
  require("../../../../impl/metadata/metadataFiles")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "profile_reconcile"
);
class Reconcile extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      let argFolder = this.flags.folder;
      let argProfileList = this.flags.profilelist;
      if (!this.flags.sourceonly) {
        if (_.isNil(this.flags.targetorg)) {
          throw new Error(
            "Either set sourceonly flag or provide and org for reconcile"
          );
        } else {
          this.org = yield core_1.Org.create({
            aliasOrUsername: this.flags.targetorg,
          });
        }
      }
      metadataFiles_1.default.sourceOnly = this.flags.sourceonly;
      if (!_.isNil(argFolder) && argFolder.length !== 0) {
        sfpowerkit_1.SFPowerkit.setDefaultFolder(argFolder[0]);
      }
      var profileUtils = new profileReconcile_1.default(
        this.org,
        this.flags.loglevel == "debug"
      );
      let result = [];
      let retryCount = 0;
      let success = false;
      while (!success && retryCount < 2) {
        try {
          var reconcileProfiles = yield profileUtils.reconcile(
            argFolder,
            argProfileList || [],
            this.flags.destfolder
          );
          // Return an object to be displayed with --json
          reconcileProfiles.forEach((file) => {
            result.push({
              state: "Cleaned",
              fullName: path.basename(
                file,
                metadataInfo_1.METADATA_INFO.Profile.sourceExtension
              ),
              type: "Profile",
              path: path.relative(process.cwd(), file),
            });
          });
          success = true;
        } catch (err) {
          sfpowerkit_1.SFPowerkit.log(err, sfpowerkit_1.LoggerLevel.ERROR);
          retryCount++;
          if (retryCount < 2) {
            sfpowerkit_1.SFPowerkit.log(
              "An error occured during profile reconcile. Retry in 10 seconds",
              sfpowerkit_1.LoggerLevel.INFO
            );
            //Wait 5 seconds
            yield this.sleep(10000);
          } else {
            sfpowerkit_1.SFPowerkit.log(
              "An error occured during profile reconcile. You can rerun the command after a moment.",
              sfpowerkit_1.LoggerLevel.ERROR
            );
          }
        }
      }
      return result;
    });
  }
  sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    });
  }
}
exports.default = Reconcile;
Reconcile.description = messages.getMessage("commandDescription");
Reconcile.examples = [
  `$ sfdx sfpowerkit:source:profile:reconcile  --folder force-app -d destfolder -s`,
  `$ sfdx sfpowerkit:source:profile:reconcile  --folder force-app,module2,module3 -u sandbox -d destfolder`,
  `$ sfdx sfpowerkit:source:profile:reconcile  -u myscratchorg -d destfolder`,
];
//public static args = [{name: 'file'}];
Reconcile.flagsConfig = {
  // flag with a value (-n, --name=VALUE)
  folder: command_1.flags.array({
    char: "f",
    description: messages.getMessage("folderFlagDescription"),
    required: false,
    map: (f) => f.trim(),
  }),
  profilelist: command_1.flags.array({
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
    required: false,
    map: (n) => n.trim(),
  }),
  destfolder: command_1.flags.directory({
    char: "d",
    description: messages.getMessage("destFolderFlagDescription"),
    required: false,
  }),
  sourceonly: command_1.flags.boolean({
    char: "s",
    description: messages.getMessage("sourceonlyFlagDescription"),
    required: false,
  }),
  targetorg: command_1.flags.string({
    char: "u",
    description: messages.getMessage("targetorgFlagDescription"),
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
Reconcile.requiresUsername = false;
// Comment this out if your command does not support a hub org username
//protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Reconcile.requiresProject = true;
Reconcile.result = {
  tableColumnData: {
    columns: [
      { key: "state", label: "State" },
      { key: "fullName", label: "Full Name" },
      { key: "type", label: "Type" },
      { key: "path", label: "Path" },
    ],
  },
  display() {
    if (Array.isArray(this.data) && this.data.length) {
      this.ux.table(this.data, this.tableColumnData);
    }
  },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvc291cmNlL3Byb2ZpbGUvcmVjb25jaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQU02QjtBQUU3QiwyQ0FBdUM7QUFDdkMsMENBQTRCO0FBQzVCLHVEQUFpRTtBQUNqRSx5RUFBdUU7QUFDdkUsMkNBQTZCO0FBQzdCLHlHQUFpRjtBQUNqRiw0RkFBb0U7QUFFcEUsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUUvRSxNQUFxQixTQUFVLFNBQVEscUJBQVc7SUFzRm5DLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUNsQyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNqQyxNQUFNLElBQUksS0FBSyxDQUNiLDZEQUE2RCxDQUM5RCxDQUFDO2lCQUNIO3FCQUFNO29CQUNMLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxVQUFH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
