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
const profileDiff_1 = __importDefault(
  require("../../../../impl/source/profiles/profileDiff")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "org_profile_diff"
);
class Diff extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      const outputFolder = this.flags.output;
      const sourceusername = this.flags.sourceusername;
      let profileList = this.flags.profilelist;
      if (!profileList || profileList.length === 0) {
        if (sourceusername && !outputFolder) {
          throw new Error("Output folder is required");
        }
      }
      let profileDiff = new profileDiff_1.default(
        profileList,
        sourceusername,
        this.org,
        outputFolder
      );
      let output = profileDiff.diff().then(() => {
        return profileDiff.output;
      });
      let outputData = yield output;
      return outputData;
    });
  }
}
exports.default = Diff;
Diff.description = messages.getMessage("commandDescription");
Diff.examples = [
  `$ sfdx sfpowerkit:org:profile:diff --profilelist profilenames --targetusername username (Compare liste profiles path against target org)`,
  `$ sfdx sfpowerkit:org:profile:diff --targetusername username (compare all profile in the project against the target org)`,
  `$ sfdx sfpowerkit:org:profile:diff --sourceusername sourcealias --targetusername username (compare all profile in the source org against the target org)`,
];
Diff.flagsConfig = {
  profilelist: command_1.flags.array({
    char: "p",
    description: messages.getMessage("profileListFlagDescription"),
    required: false,
    map: (n) => n.trim(),
  }),
  sourceusername: command_1.flags.string({
    char: "s",
    description: messages.getMessage("sourceUsernameDescription"),
    required: false,
  }),
  output: command_1.flags.string({
    char: "d",
    description: messages.getMessage("outputFolderDescription"),
    required: false,
  }),
  apiversion: command_1.flags.builtin(),
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
Diff.result = {
  tableColumnData: {
    columns: [
      { key: "status", label: "Status" },
      { key: "metadataType", label: "Type" },
      { key: "componentName", label: "Component Name" },
      { key: "path", label: "Path" },
    ],
  },
  display() {
    if (Array.isArray(this.data) && this.data.length) {
      this.ux.table(this.data, this.tableColumnData);
    }
  },
};
Diff.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L29yZy9wcm9maWxlL2RpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFNNkI7QUFDN0IsdURBQW9EO0FBQ3BELCtGQUEyRTtBQUUzRSx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUU5RSxNQUFxQixJQUFLLFNBQVEscUJBQVc7SUFrRTlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxNQUFNLFlBQVksR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMvQyxNQUFNLGNBQWMsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztZQUN6RCxJQUFJLFdBQVcsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUNuRCxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1QyxJQUFJLGNBQWMsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2lCQUM5QzthQUNGO1lBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxxQkFBZSxDQUNuQyxXQUFXLEVBQ1gsY0FBYyxFQUNkLElBQUksQ0FBQyxHQUFHLEVBQ1IsWUFBWSxDQUNiLENBQUM7WUFDRixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxF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
