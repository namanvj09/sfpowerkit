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
const diffImpl_1 = __importDefault(
  require("../../../impl/project/diff/diffImpl")
);
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const core_1 = require("@salesforce/core");
const rimraf = __importStar(require("rimraf"));
const fsextra = __importStar(require("fs-extra"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "project_diff"
);
class Diff extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      const outputFolder = this.flags.output;
      const revisionfrom = this.flags.revisionfrom;
      const revisionto = this.flags.revisionto;
      let diffUtils = new diffImpl_1.default(
        revisionfrom,
        revisionto,
        this.flags.generatedestructive,
        this.flags.bypass
      );
      let diffOutput = yield diffUtils.build(
        outputFolder,
        this.flags.packagedirectories,
        this.flags.apiversion
      );
      let errors = diffOutput.filter((element) => {
        return element["action"] === "ERROR";
      });
      if (errors && errors.length > 0) {
        this.ux.log("ERRORS");
        this.ux.table(errors, {
          columns: [
            { key: "path", label: "Path" },
            { key: "message", label: "Error Message" },
          ],
        });
        rimraf.sync(outputFolder);
        if (this.flags.json) {
          //In case of error, the diff output is still printed in the output folder
          if (fsextra.existsSync(outputFolder) == false) {
            fsextra.mkdirSync(outputFolder);
            core_1.fs.writeJson(
              path.join(outputFolder, "diff.json"),
              diffOutput
            );
          }
        }
        throw new Error("Error parsing diff.");
      } else {
        core_1.fs.writeJson(path.join(outputFolder, "diff.json"), diffOutput);
      }
      return diffOutput;
    });
  }
}
exports.default = Diff;
Diff.description = messages.getMessage("commandDescription");
Diff.examples = [
  `$ sfdx sfpowerkit:project:diff --diffFile DiffFileName --encoding EncodingOfFile --output OutputFolder`,
  `$ sfdx sfpowerkit:project:diff --revisionfrom revisionfrom --revisionto revisionto --output OutputFolder
   `,
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
  }),
  output: command_1.flags.string({
    char: "d",
    description: messages.getMessage("outputFolderDescription"),
    required: true,
  }),
  generatedestructive: command_1.flags.boolean({
    char: "x",
    description: messages.getMessage(
      "generativeDestructiveManifestDescription"
    ),
    required: false,
  }),
  bypass: command_1.flags.array({
    required: false,
    char: "b",
    description: messages.getMessage("itemsToBypass"),
  }),
  packagedirectories: command_1.flags.array({
    required: false,
    char: "p",
    description: messages.getMessage("packagedirectories"),
  }),
  apiversion: command_1.flags.builtin({
    description: messages.getMessage("apiversion"),
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
Diff.result = {
  tableColumnData: {
    columns: [
      { key: "action", label: "Action (Deploy/Delete)" },
      { key: "metadataType", label: "Type" },
      { key: "componentName", label: "Component Name" },
      { key: "path", label: "Path" },
    ],
  },
  display() {
    if (Array.isArray(this.data) && this.data.length) {
      this.ux.table(
        this.data.filter((element) => {
          return element["action"] !== "ERROR";
        }),
        this.tableColumnData
      );
    }
  },
};
Diff.requiresUsername = false;
Diff.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3Byb2plY3QvZGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFNNkI7QUFDN0IsbUZBQTJEO0FBQzNELDJDQUE2QjtBQUM3QixvREFBaUQ7QUFDakQsMkNBQXNDO0FBQ3RDLCtDQUFpQztBQUNqQyxrREFBb0M7QUFFcEMsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFMUUsTUFBcUIsSUFBSyxTQUFRLHFCQUFXO0lBMEY5QixHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsTUFBTSxZQUFZLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDL0MsTUFBTSxZQUFZLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDckQsTUFBTSxVQUFVLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFakQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUSxDQUMxQixZQUFZLEVBQ1osVUFBVSxFQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUNsQixDQUFDO1lBRUYsSUFBSSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUNwQyxZQUFZLEVBQ1osSUFBSSxD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
