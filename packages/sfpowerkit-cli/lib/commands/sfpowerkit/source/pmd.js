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
const find_java_home_1 = __importDefault(require("find-java-home"));
const child_process_1 = require("child_process");
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const extract_1 = require("../../../utils/extract");
const util_1 = require("util");
const xml2js = __importStar(require("xml2js"));
const core_1 = require("@salesforce/core");
const request = require("request");
const fs = require("fs");
const path = require("path");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "source_pmd"
);
class Pmd extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      if (util_1.isNullOrUndefined(this.flags.javahome)) {
        this.javahome = yield this.findJavaHomeAsync();
        sfpowerkit_1.SFPowerkit.log(
          `Found Java Home at ${this.javahome}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      }
      //Download PMD
      let cache_directory = fileutils_1.default.getGlobalCacheDir();
      let pmd_cache_directory = path.join(cache_directory, "pmd");
      if (
        !fs.existsSync(
          path.join(pmd_cache_directory, `pmd-bin-${this.flags.version}`)
        )
      ) {
        sfpowerkit_1.SFPowerkit.log(
          "Initiating Download of  PMD",
          sfpowerkit_1.LoggerLevel.INFO
        );
        if (!fs.existsSync(pmd_cache_directory))
          fs.mkdirSync(pmd_cache_directory);
        yield this.downloadPMD(this.flags.version, pmd_cache_directory);
        sfpowerkit_1.SFPowerkit.log(
          `Downloaded PMD ${this.flags.version}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        yield extract_1.extract(
          path.join(pmd_cache_directory, "pmd.zip"),
          pmd_cache_directory
        );
        sfpowerkit_1.SFPowerkit.log(
          `Extracted PMD ${this.flags.version}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      }
      const pmdClassPath = path.join(
        pmd_cache_directory,
        `pmd-bin-${this.flags.version}`,
        "lib",
        "*"
      );
      const pmdOutputPath = path.join(
        pmd_cache_directory,
        `pmd-bin-${this.flags.version}`,
        "sf-pmd-output.xml"
      );
      //Directory to be scanned
      let packageDirectory = util_1.isNullOrUndefined(this.flags.directory)
        ? yield sfpowerkit_1.SFPowerkit.getDefaultFolder()
        : this.flags.directory;
      //Default Ruleset
      let ruleset =
        util_1.isNullOrUndefined(this.flags.ruleset) ||
        this.flags.ruleset.toLowerCase() === "sfpowerkit"
          ? path.join(
              __dirname,
              "..",
              "..",
              "..",
              "..",
              "resources",
              "pmd-ruleset.xml"
            )
          : this.flags.ruleset;
      if (!fs.existsSync(path.resolve(ruleset))) {
        throw new core_1.SfdxError(
          `The given rulesheet cannot be found ${ruleset}`
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        `PMD release ${this.flags.version}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      sfpowerkit_1.SFPowerkit.log(
        `Now analyzing ${packageDirectory}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let dir = path.parse(this.flags.report).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      const pmdCmd = child_process_1.spawn(
        path.join(this.javahome, "bin", "java"),
        [
          "-cp",
          pmdClassPath,
          "net.sourceforge.pmd.PMD",
          "-l",
          "apex",
          "-d",
          packageDirectory,
          "-R",
          ruleset,
          "-f",
          "xml",
          "-r",
          pmdOutputPath,
        ]
      );
      const pmdCmdForConsoleLogging = child_process_1.spawn(
        path.join(this.javahome, "bin", "java"),
        [
          "-cp",
          pmdClassPath,
          "net.sourceforge.pmd.PMD",
          "-l",
          "apex",
          "-d",
          packageDirectory,
          "-R",
          ruleset,
          "-f",
          this.flags.format,
          "-r",
          this.flags.report,
        ]
      );
      //capture pmd errors
      let pmd_error;
      let pmd_output;
      pmdCmd.stderr.on("data", (data) => {
        pmd_error = data;
      });
      pmdCmd.stdout.on("data", (data) => {
        pmd_output = data;
      });
      pmdCmd.on("close", (code) => {
        if (code == 4 || code == 0) {
          this.parseXmlReport(pmdOutputPath, packageDirectory);
          if (!this.flags.supressoutput) {
            let violations = fs.readFileSync(this.flags.report).toString();
            sfpowerkit_1.SFPowerkit.log(
              violations,
              sfpowerkit_1.LoggerLevel.INFO
            );
          }
        } else if (code == 1) {
          sfpowerkit_1.SFPowerkit.log(
            "PMD Exited with some exceptions ",
            sfpowerkit_1.LoggerLevel.INFO
          );
          sfpowerkit_1.SFPowerkit.log(
            pmd_error.toString(),
            sfpowerkit_1.LoggerLevel.ERROR
          );
        }
      });
    });
  }
  findJavaHomeAsync() {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        find_java_home_1.default({ allowJre: true }, (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
      });
    });
  }
  downloadPMD(npm_package_pmd_version, pmd_chache_directory) {
    return __awaiter(this, void 0, void 0, function* () {
      let file = fs.createWriteStream(
        path.join(pmd_chache_directory, "pmd.zip")
      );
      yield new Promise((resolve, reject) => {
        let stream = request({
          /* Here you should specify the exact link to the file you are trying to download */
          uri: `https://github.com/pmd/pmd/releases/download/pmd_releases%2F${npm_package_pmd_version}/pmd-bin-${npm_package_pmd_version}.zip`,
        })
          .pipe(file)
          .on("finish", () => {
            resolve();
          })
          .on("error", (error) => {
            reject(error);
          });
      }).catch((error) => {
        sfpowerkit_1.SFPowerkit.log(
          `Unable to download: ${error}`,
          sfpowerkit_1.LoggerLevel.ERROR
        );
      });
    });
  }
  parseXmlReport(xmlReport, moduleName) {
    let fileCount = 0;
    let violationCount = 0;
    let reportContent = fs.readFileSync(xmlReport, "utf-8");
    xml2js.parseString(reportContent, (err, data) => {
      // If the file is not XML, or is not from PMD, return immediately
      if (!data || !data.pmd) {
        sfpowerkit_1.SFPowerkit.log(
          `Empty or unrecognized PMD xml report ${xmlReport}`,
          sfpowerkit_1.LoggerLevel.ERROR
        );
        return null;
      }
      if (!data.pmd.file || data.pmd.file.length === 0) {
        // No files with violations, return now that it has been marked for upload
        sfpowerkit_1.SFPowerkit.log(
          `A PMD report was found for module '${moduleName}' but it contains no violations`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        return null;
      }
      data.pmd.file.forEach((file) => {
        if (file.violation) {
          fileCount++;
          violationCount += file.violation.length;
        }
      });
      sfpowerkit_1.SFPowerkit.log(
        `PMD analyzation complete  for module '${moduleName}' containing ${violationCount} issues, Report available at ${this.flags.report}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
    });
    return [violationCount, fileCount];
  }
}
exports.default = Pmd;
Pmd.description = messages.getMessage("commandDescription");
Pmd.examples = [`$ sfdx sfpowerkit:source:pmd`];
Pmd.flagsConfig = {
  directory: command_1.flags.string({
    required: false,
    char: "d",
    description: messages.getMessage("directoryFlagDescription"),
  }),
  ruleset: command_1.flags.string({
    required: false,
    char: "r",
    description: messages.getMessage("rulesetFlagDescription"),
  }),
  format: command_1.flags.string({
    required: false,
    char: "f",
    default: "text",
    description: messages.getMessage("formatFlagDescription"),
  }),
  report: command_1.flags.filepath({
    required: false,
    char: "o",
    default: "pmd-output",
    description: messages.getMessage("reportFlagDescription"),
  }),
  javahome: command_1.flags.string({
    required: false,
    description: messages.getMessage("javaHomeFlagDescription"),
  }),
  supressoutput: command_1.flags.boolean({
    required: false,
    default: false,
    description: messages.getMessage("supressoutputFlagDescription"),
  }),
  version: command_1.flags.string({
    required: false,
    default: "6.30.0",
    description: messages.getMessage("versionFlagDescription"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG1kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvc291cmNlL3BtZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBNEU7QUFDNUUsb0VBQTBDO0FBQzFDLGlEQUFzQztBQUN0Qyx5RUFBaUQ7QUFDakQsb0RBQThEO0FBQzlELG9EQUFpRDtBQUNqRCwrQkFBeUM7QUFDekMsK0NBQWlDO0FBQ2pDLDJDQUE2QztBQUU3QyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3Qix3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUV4RSxNQUFxQixHQUFJLFNBQVEscUJBQVc7SUFzRTdCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxJQUFJLHdCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0MsdUJBQVUsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSx3QkFB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
