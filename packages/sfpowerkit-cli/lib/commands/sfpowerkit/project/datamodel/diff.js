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
const sfpowerkit_1 = require("../../../../sfpowerkit");
const fs = __importStar(require("fs-extra"));
const simple_git_1 = __importDefault(require("simple-git"));
const util_1 = require("util");
const DataModelSourceDiffImpl_1 = __importDefault(
  require("../../../../impl/project/metadata/DataModelSourceDiffImpl")
);
const path = __importStar(require("path"));
const fileutils_1 = __importDefault(require("../../../../utils/fileutils"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "project_datamodel_diff"
);
class Diff extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      let isOutputCSV = this.flags.csv;
      let outputDirectory = this.flags.outputdir
        ? this.flags.outputdir
        : process.cwd();
      let git = simple_git_1.default();
      const revisionFrom = yield git.revparse([
        "--short",
        this.flags.revisionfrom,
      ]);
      const revisionTo = yield git.revparse(["--short", this.flags.revisionto]);
      let packageDirectories;
      if (!util_1.isNullOrUndefined(this.flags.packagedirectories)) {
        packageDirectories = this.flags.packagedirectories.split(",");
        packageDirectories = packageDirectories.map((dir) => {
          return dir.trim().toLocaleLowerCase();
        });
        let projectConfig = JSON.parse(
          fs.readFileSync("sfdx-project.json", "utf8")
        );
        packageDirectories.forEach((dir) => {
          let isValidPackageDir;
          projectConfig["packageDirectories"].forEach((configPackageDir) => {
            if (dir == configPackageDir["path"].toLocaleLowerCase())
              isValidPackageDir = true;
          });
          if (!isValidPackageDir)
            throw new Error("Invalid package directory supplied");
        });
      }
      let dataModelSourceDiffImpl = new DataModelSourceDiffImpl_1.default(
        git,
        revisionFrom,
        revisionTo,
        packageDirectories
      );
      let sourceDiffResult = yield dataModelSourceDiffImpl.exec();
      if (sourceDiffResult.length < 1) {
        sfpowerkit_1.SFPowerkit.log(
          `No Datamodel change found between ${revisionFrom} and ${revisionTo}`,
          sfpowerkit_1.LoggerLevel.WARN
        );
        return sourceDiffResult;
      }
      sfpowerkit_1.SFPowerkit.log(
        `Found ${sourceDiffResult.length} Datamodel change between ${revisionFrom} and ${revisionTo} \n`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let csvPath = `${outputDirectory}/datamodel-diff-output.json`;
      let dir = path.parse(csvPath).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      fs.writeFileSync(csvPath, JSON.stringify(sourceDiffResult, null, 4));
      let rowsToDisplay = [];
      for (let file of sourceDiffResult) {
        for (let change of file["diff"]) {
          rowsToDisplay.push({
            object: file["object"],
            api_name: file["api_name"],
            type: file["type"],
            operation: change["operation"],
            coordinates: change["coordinates"],
            from: change["before"],
            to: change["after"],
            filepath: file["filepath"],
          });
        }
      }
      if (isOutputCSV) {
        let csvOutput = `Object,API_Name,Type,Operation,Coordinates,Commit ID (${revisionFrom}),Commit ID (${revisionTo}),Filepath\n`;
        for (let row of rowsToDisplay) {
          let rowCells = Object.values(row);
          csvOutput = csvOutput + `${rowCells.toString()}\n`;
        }
        fs.writeFileSync(
          `${outputDirectory}/datamodel-diff-output.csv`,
          csvOutput
        );
      }
      this.ux.table(rowsToDisplay.slice(0, 50), [
        "object",
        "api_name",
        "type",
        "operation",
        "coordinates",
        "from",
        "to",
      ]);
      this.ux.log("\n");
      if (rowsToDisplay.length > 50) {
        sfpowerkit_1.SFPowerkit.log(
          "Displaying output limited to 50 rows",
          sfpowerkit_1.LoggerLevel.WARN
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        `JSON output written to ${outputDirectory}/datamodel-diff-output.json`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      if (isOutputCSV) {
        sfpowerkit_1.SFPowerkit.log(
          `CSV output written to ${outputDirectory}/datamodel-diff-output.csv`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      }
      return sourceDiffResult;
    });
  }
}
exports.default = Diff;
Diff.description = messages.getMessage("commandDescription");
Diff.examples = [
  `$ sfdx sfpowerkit:project:datamodel:diff --revisionfrom revisionfrom --revisionto revisionto --csv`,
];
Diff.flagsConfig = {
  revisionfrom: command_1.flags.string({
    char: "r",
    description: messages.getMessage("revisionFromDescription"),
    required: true,
  }),
  revisionto: command_1.flags.string({
    char: "t",
    description: messages.getMessage("revisionToDescription"),
    required: false,
    default: "HEAD",
  }),
  packagedirectories: command_1.flags.string({
    required: false,
    char: "p",
    description: messages.getMessage("packageDirectoriesDescription"),
  }),
  outputdir: command_1.flags.directory({
    required: false,
    char: "d",
    description: messages.getMessage("outputDirDescription"),
  }),
  csv: command_1.flags.boolean({
    required: false,
    description: messages.getMessage("csvDescription"),
    default: false,
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
Diff.requiresUsername = false;
Diff.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3Byb2plY3QvZGF0YW1vZGVsL2RpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTRFO0FBQzVFLHVEQUFpRTtBQUNqRSw2Q0FBK0I7QUFDL0IsNERBQWtEO0FBQ2xELCtCQUF5QztBQUN6Qyx3SEFBZ0c7QUFDaEcsMkNBQTZCO0FBQzdCLDRFQUFvRDtBQUdwRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osd0JBQXdCLENBQ3pCLENBQUM7QUFFRixNQUFxQixJQUFLLFNBQVEscUJBQVc7SUEwRDlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUNqQyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7Z0JBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7Z0JBQ3RCLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFbEIsSUFBSSxHQUFHLEdBQWMsb0JBQVMsRUFBRSxDQUFDO1lBRWpDLE1BQU0sWUFBWSxHQUFXLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQztnQkFDOUMsU0FBUztnQkFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVk7YUFDeEIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxVQUFVLEdBQVcsTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDO2dCQUM1QyxTQUFTO2dCQUNULElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTthQUN0QixDQUFDLENBQUM7WUFFSCxJQUFJLGtCQUE0QixDQUFDO1lBRWpDLElBQUksQ0FBQyx3QkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ3JELGtCQUFrQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hELE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQzVCLEVBQUUsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLENBQzdDLENBQUM7Z0JBQ0Ysa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMvQixJQUFJLGlCQUEwQixDQUFDO29CQUMvQixhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTt3QkFDN0QsSUFBSSxHQUFHLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsaUJBQWlCLEVBQUU7NEJBQ3JELGlCQUFpQixHQUFHLElBQUksQ0FBQztvQkFDN0IsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLGlCQUFpQjt3QkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSx1QkFBdUIsR0FBRyxJQUFJLGlDQUF1QixDQUN2RCxHQUFHLEVBQ0gsWUFBWSxFQUNaLFVBQVUsRUFDVixrQkFBa0IsQ0FDbkIsQ0FBQztZQUVGLElBQUksZ0JBQWdCLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU1RCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLHVCQUFVLENBQUMsR0FBRyxDQUNaLHFDQUFxQyxZQUFZLFFBQVEsVUFBVSxFQUFFLEVBQ3JFLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2dCQUNGLE9BQU8sZ0JBQWdCLENBQUM7YUFDekI7WUFFRCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixTQUFTLGdCQUFnQixDQUFDLE1BQU0sNkJBQTZCLFlBQVksUUFBUSxVQUFVLEtBQUssRUFDaEcsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFFRixJQUFJLE9BQU8sR0FBRyxHQUFHLGVBQWUsNkJBQTZCLENBQUM7WUFDOUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDbEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLG1CQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRSxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDdkIsS0FBSyxJQUFJLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtnQkFDakMsS0FBSyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQy9CLGFBQWEsQ0FBQyxJQUFJLENBQUM7d0JBQ2pCLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUN0QixRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQzt3QkFDMUIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQ2xCLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDO3dCQUM5QixXQUFXLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQzt3QkFDbEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ3RCLEVBQUUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDO3dCQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztxQkFDM0IsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7WUFFRCxJQUFJLFdBQVcsRUFBRTtnQkFDZixJQUFJLFNBQVMsR0FBVyx5REFBeUQsWUFBWSxnQkFBZ0IsVUFBVSxjQUFjLENBQUM7Z0JBRXRJLEtBQUssSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFO29CQUM3QixJQUFJLFFBQVEsR0FBYSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLEdBQUcsU0FBUyxHQUFHLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7aUJBQ3BEO2dCQUVELEVBQUUsQ0FBQyxhQUFhLENBQ2QsR0FBRyxlQUFlLDRCQUE0QixFQUM5QyxTQUFTLENBQ1YsQ0FBQzthQUNIO1lBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ3hDLFFBQVE7Z0JBQ1IsVUFBVTtnQkFDVixNQUFNO2dCQUNOLFdBQVc7Z0JBQ1gsYUFBYTtnQkFDYixNQUFNO2dCQUNOLElBQUk7YUFDTCxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO2dCQUM3Qix1QkFBVSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsRUFBRSx3QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzFFO1lBRUQsdUJBQVUsQ0FBQyxHQUFHLENBQ1osMEJBQTBCLGVBQWUsNkJBQTZCLEVBQ3RFLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO1lBRUYsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsdUJBQVUsQ0FBQyxHQUFHLENBQ1oseUJBQXlCLGVBQWUsNEJBQTRCLEVBQ3BFLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2FBQ0g7WUFDRCxPQUFPLGdCQUFnQixDQUFDO1FBQzFCLENBQUM7S0FBQTs7QUF2TEgsdUJBd0xDO0FBdkxlLGdCQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXhELGFBQVEsR0FBRztJQUN2QixvR0FBb0c7Q0FDckcsQ0FBQztBQUVlLGdCQUFXLEdBQWdCO0lBQzFDLFlBQVksRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUM7UUFDM0QsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDO0lBQ0YsVUFBVSxFQUFFLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6RCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxNQUFNO0tBQ2hCLENBQUM7SUFDRixrQkFBa0IsRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQy9CLFFBQVEsRUFBRSxLQUFLO1FBQ2YsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQztLQUNsRSxDQUFDO0lBQ0YsU0FBUyxFQUFFLGVBQUssQ0FBQyxTQUFTLENBQUM7UUFDekIsUUFBUSxFQUFFLEtBQUs7UUFDZixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDO0tBQ3pELENBQUM7SUFDRixHQUFHLEVBQUUsZUFBSyxDQUFDLE9BQU8sQ0FBQztRQUNqQixRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ2xELE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQztJQUNGLFFBQVEsRUFBRSxlQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsRUFBRSwyQ0FBMkM7UUFDeEQsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRTtZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0YsQ0FBQztDQUNILENBQUM7QUFFZSxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDekIsb0JBQWUsR0FBRyxJQUFJLENBQUMifQ==
