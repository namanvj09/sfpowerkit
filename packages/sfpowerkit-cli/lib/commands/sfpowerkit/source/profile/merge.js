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
const path = __importStar(require("path"));
const metadataInfo_1 = require("../../../../impl/metadata/metadataInfo");
const profileRetriever_1 = __importDefault(
  require("../../../../impl/metadata/retriever/profileRetriever")
);
const profileMerge_1 = __importDefault(
  require("../../../../impl/source/profiles/profileMerge")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "profile_merge"
);
class Merge extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      let argFolder = this.flags.folder;
      let argProfileList = this.flags.profilelist;
      let argMetadatas = this.flags.metadata;
      let metadatas = undefined;
      let invalidArguments = [];
      if (argMetadatas !== undefined) {
        metadatas = {};
        profileRetriever_1.default.supportedMetadataTypes.forEach((val) => {
          metadatas[val] = [];
        });
        for (let i = 0; i < argMetadatas.length; i++) {
          if (
            profileRetriever_1.default.supportedMetadataTypes.includes(
              argMetadatas[i].MetadataType
            )
          ) {
            metadatas[argMetadatas[i].MetadataType].push(
              argMetadatas[i].ApiName
            );
          } else {
            invalidArguments.push(argMetadatas[i].MetadataType);
          }
        }
        if (invalidArguments.length > 0) {
          throw new core_1.SfdxError(
            "Metadata(s) " +
              invalidArguments.join(", ") +
              " is/are not supported.",
            "InvalidArgumentError"
          );
        }
      }
      if (!_.isNil(argFolder) && argFolder.length !== 0) {
        sfpowerkit_1.SFPowerkit.setDefaultFolder(argFolder[0]);
      }
      ``;
      const profileUtils = new profileMerge_1.default(
        this.org,
        this.flags.loglevel == "debug"
      );
      var mergedProfiles = yield profileUtils.merge(
        argFolder,
        argProfileList || [],
        metadatas,
        this.flags.delete
      );
      let result = [];
      if (mergedProfiles.added) {
        mergedProfiles.added.forEach((file) => {
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
      if (mergedProfiles.updated) {
        mergedProfiles.updated.forEach((file) => {
          result.push({
            state: "Merged",
            fullName: path.basename(
              file,
              metadataInfo_1.METADATA_INFO.Profile.sourceExtension
            ),
            type: "Profile",
            path: path.relative(process.cwd(), file),
          });
        });
      }
      if (mergedProfiles.deleted && this.flags.delete) {
        mergedProfiles.deleted.forEach((file) => {
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
exports.default = Merge;
Merge.description = messages.getMessage("commandDescription");
Merge.examples = [
  `$ sfdx sfpowerkit:source:profile:merge -u sandbox`,
  `$ sfdx sfpowerkit:source:profile:merge -f force-app -n "My Profile" -r -u sandbox`,
  `$ sfdx sfpowerkit:source:profile:merge -f "module1, module2, module3" -n "My Profile1, My profile2"  -u sandbox`,
];
//public static args = [{ name: 'file' }];
Merge.flagsConfig = {
  // flag with a value (-n, --name=VALUE)
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
    map: (n) => n.trim(),
  }),
  metadata: command_1.flags.array({
    char: "m",
    description: messages.getMessage("metadataFlagDescription"),
    required: false,
    delimiter: ",",
    map: (val) => {
      let parts = val.split(":");
      return {
        MetadataType: parts[0].trim(),
        ApiName: parts.length >= 2 ? parts[1].trim() : "*",
      };
    },
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
Merge.requiresUsername = true;
// Comment this out if your command does not support a hub org username
//protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Merge.requiresProject = true;
Merge.result = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9zb3VyY2UvcHJvZmlsZS9tZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFNNkI7QUFFN0IsMkNBQTZDO0FBRTdDLDBDQUE0QjtBQUM1Qix1REFBb0Q7QUFDcEQsMkNBQTZCO0FBQzdCLHlFQUF1RTtBQUN2RSw0R0FBb0Y7QUFDcEYsaUdBQXlFO0FBRXpFLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRTNFLE1BQXFCLEtBQU0sU0FBUSxxQkFBVztJQXlGL0IsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ2xDLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQzVDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRXZDLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMxQixJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUUxQixJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsMEJBQWdCLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLEdB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
