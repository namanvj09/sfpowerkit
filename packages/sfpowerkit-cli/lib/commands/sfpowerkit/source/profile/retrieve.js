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
const fs = __importStar(require("fs-extra"));
const _ = __importStar(require("lodash"));
const sfpowerkit_1 = require("../../../../sfpowerkit");
const path = __importStar(require("path"));
const metadataInfo_1 = require("../../../../impl/metadata/metadataInfo");
const profileSync_1 = __importDefault(
  require("../../../../impl/source/profiles/profileSync")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "profile_retrieve"
);
class Retrieve extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      let argFolder = this.flags.folder;
      let argProfileList = this.flags.profilelist;
      let folders = [];
      if (!_.isNil(argFolder) && argFolder.length !== 0) {
        for (let dir of argFolder) {
          if (!fs.existsSync(dir)) {
            throw new core_1.SfdxError(
              `The profile path ${dir} doesnot exist.`
            );
          }
        }
        folders.push(...argFolder);
      }
      const profileUtils = new profileSync_1.default(
        this.org,
        this.flags.loglevel == "debug"
      );
      let syncPofles = yield profileUtils.sync(
        folders,
        argProfileList || [],
        this.flags.delete
      );
      let result = [];
      if (syncPofles.added) {
        syncPofles.added.forEach((file) => {
          result.push({
            state: "Add",
            fullName: path.basename(
              file,
              metadataInfo_1.METADATA_INFO.Profile.sourceExtension
            ),
            type: "Profile",
            path: path.relative(process.cwd(), file),
          });
        });
      }
      if (syncPofles.updated) {
        syncPofles.updated.forEach((file) => {
          result.push({
            state: "Updated",
            fullName: path.basename(
              file,
              metadataInfo_1.METADATA_INFO.Profile.sourceExtension
            ),
            type: "Profile",
            path: path.relative(process.cwd(), file),
          });
        });
      }
      if (syncPofles.deleted && this.flags.delete) {
        syncPofles.deleted.forEach((file) => {
          result.push({
            state: "Deleted",
            fullName: path.basename(
              file,
              metadataInfo_1.METADATA_INFO.Profile.sourceExtension
            ),
            type: "Profile",
            path: path.relative(process.cwd(), file),
          });
        });
      }
      return result;
    });
  }
}
exports.default = Retrieve;
Retrieve.description = messages.getMessage("commandDescription");
Retrieve.examples = [
  `$ sfdx sfpowerkit:source:profile:retrieve -u prod`,
  `$ sfdx sfpowerkit:source:profile:retrieve  -f force-app -n "My Profile" -u prod`,
  `$ sfdx sfpowerkit:source:profile:retrieve  -f "module1, module2, module3" -n "My Profile1, My profile2"  -u prod`,
];
//public static args = [{ name: 'file' }];
Retrieve.flagsConfig = {
  folder: command_1.flags.array({
    char: "f",
    description: messages.getMessage("folderFlagDescription"),
    required: false,
    map: (f) => f.trim(),
  }),
  profilelist: command_1.flags.array({
    char: "n",
    description: messages.getMessage("profileListFlagDescription"),
    required: false,
    map: (p) => p.trim(),
  }),
  delete: command_1.flags.boolean({
    char: "d",
    description: messages.getMessage("deleteFlagDescription"),
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
Retrieve.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Retrieve.requiresProject = true;
Retrieve.result = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0cmlldmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9zb3VyY2UvcHJvZmlsZS9yZXRyaWV2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFNNkI7QUFFN0IsMkNBQTBEO0FBQzFELDZDQUErQjtBQUMvQiwwQ0FBNEI7QUFDNUIsdURBQW9EO0FBQ3BELDJDQUE2QjtBQUM3Qix5RUFBdUU7QUFDdkUsK0ZBQXVFO0FBRXZFLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFOUUsTUFBcUIsUUFBUyxTQUFRLHFCQUFXO0lBd0VsQyxHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsSUFBSSxTQUFTLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDMUMsSUFBSSxjQUFjLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFFdEQsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqRCxLQUFLLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRTtvQkFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3ZC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
