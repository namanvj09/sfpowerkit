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
const orgDiffImpl_1 = __importDefault(
  require("../../../impl/project/orgdiff/orgDiffImpl")
);
const core_1 = require("@salesforce/core");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "project_orgdiff"
);
class OrgDiff extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setUx(this.ux);
      this.ux.startSpinner("Running...");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      let filesOrFolders = this.flags.filesorfolders;
      let orgDiff = new orgDiffImpl_1.default(
        filesOrFolders,
        this.org,
        !this.flags.noconflictmarkers
      );
      let output = yield orgDiff.orgDiff();
      this.ux.stopSpinner("Completed");
      if (!this.flags.outputformat || this.flags.outputformat == "json") {
        core_1.fs.writeJson("orgdiff.json", output);
      } else if (this.flags.outputformat == "csv") {
        yield this.generateCSVOutput(output);
      }
      return output;
    });
  }
  generateCSVOutput(result) {
    return __awaiter(this, void 0, void 0, function* () {
      let newLine = "\r\n";
      let output = "status,metadataType,componentName,path" + newLine;
      result.forEach((element) => {
        output = `${output}${element.status},${element.metadataType},${element.componentName},${element.path}${newLine}`;
      });
      core_1.fs.writeFile("orgdiff.csv", output);
    });
  }
}
exports.default = OrgDiff;
OrgDiff.description = messages.getMessage("commandDescription");
OrgDiff.examples = [
  `$ sfdx sfpowerkit:project:orgdiff --filesorfolders directory --noconflictmarkers --targetusername sandbox`,
  `$ sfdx sfpowerkit:project:orgdiff -f fileName --targetusername sandbox`,
];
OrgDiff.flagsConfig = {
  filesorfolders: command_1.flags.array({
    char: "f",
    description: messages.getMessage("filesOrFoldersFlagDescription"),
    required: true,
    map: (f) => f.trim(),
  }),
  noconflictmarkers: command_1.flags.boolean({
    char: "c",
    description: messages.getMessage("noConflictMarkersDescription"),
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
  outputformat: command_1.flags.enum({
    required: false,
    char: "o",
    description: messages.getMessage("outputFormatFlagDescription"),
    options: ["json", "csv"],
  }),
};
OrgDiff.result = {
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
OrgDiff.requiresUsername = true;
OrgDiff.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3Byb2plY3Qvb3JnZGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlEQU02QjtBQUM3QixvREFBaUQ7QUFDakQsNEZBQW9FO0FBQ3BFLDJDQUFzQztBQUV0Qyx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRTdFLE1BQXFCLE9BQVEsU0FBUSxxQkFBVztJQWtFakMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztZQUUvQyxJQUFJLE9BQU8sR0FBRyxJQUFJLHFCQUFXLENBQzNCLGNBQWMsRUFDZCxJQUFJLENBQUMsR0FBRyxFQUNSLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FDOUIsQ0FBQztZQUVGLElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxNQUFNLEVBQUU7Z0JBQ2pFLFNBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDO2lCQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksS0FBSyxFQUFFO2dCQUMzQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN0QztZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUNZLGlCQUFpQixDQUFDLE1BQWE7O1lBQzFDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLE1BQU0sR0FBRyx3Q0FBd0MsR0FBRyxPQUFPLENBQUM7WUFDaEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxFQUFFLENBQUM7WUFDbkgsQ0FBQyxDQUFDLENBQUM7WUFDSCxTQUFFLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDO0tBQUE7O0FBL0ZILDBCQWdHQztBQS9GZSxtQkFBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV4RCxnQkFBUSxHQUFHO0lBQ3ZCLDJHQUEyRztJQUMzRyx3RUFBd0U7Q0FDekUsQ0FBQztBQUVlLG1CQUFXLEdBQWdCO0lBQzFDLGNBQWMsRUFBRSxlQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUM7UUFDakUsUUFBUSxFQUFFLElBQUk7UUFDZCxHQUFHLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7S0FDN0IsQ0FBQztJQUNGLGlCQUFpQixFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQztRQUNoRSxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsUUFBUSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkIsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1I7S0FDRixDQUFDO0lBQ0YsWUFBWSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDdkIsUUFBUSxFQUFFLEtBQUs7UUFDZixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLDZCQUE2QixDQUFDO1FBQy9ELE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7S0FDekIsQ0FBQztDQUNILENBQUM7QUFFWSxjQUFNLEdBQWU7SUFDakMsZUFBZSxFQUFFO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7WUFDbEMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7WUFDdEMsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRTtZQUNqRCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtTQUMvQjtLQUNGO0lBQ0QsT0FBTztRQUNMLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDaEQ7SUFDSCxDQUFDO0NBQ0YsQ0FBQztBQUVlLHdCQUFnQixHQUFHLElBQUksQ0FBQztBQUN4Qix1QkFBZSxHQUFHLElBQUksQ0FBQyJ9
