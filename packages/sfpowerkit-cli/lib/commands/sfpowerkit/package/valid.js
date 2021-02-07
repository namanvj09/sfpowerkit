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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SFDXPackage = void 0;
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs-extra"));
const rimraf = __importStar(require("rimraf"));
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const GetNodeWrapper_1 = require("../../../sfdxnode/GetNodeWrapper");
const parallel_1 = require("../../../sfdxnode/parallel");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages("sfpowerkit", "valid");
class Valid extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      GetNodeWrapper_1.loadSFDX();
      // Getting Project config
      const project = yield core_1.SfdxProject.resolve();
      const projectJson = yield project.retrieveSfdxProjectJson();
      let resourcePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "resources",
        "metadata.json"
      );
      let fileData = fs.readFileSync(resourcePath, "utf8");
      this.coverageJSON = JSON.parse(fileData);
      if (this.isNotDefaultApiVersion()) {
        this.useCustomCoverageJSON();
      }
      let packageToBeScanned = this.flags.package;
      const packageDirectories = projectJson.get("packageDirectories") || [];
      const result_store = [];
      if (packageToBeScanned != undefined) {
        sfpowerkit_1.SFPowerkit.log(
          `Analyzing ${packageToBeScanned}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        for (const sf_package of packageDirectories) {
          if (
            packageToBeScanned != undefined &&
            packageToBeScanned === sf_package["package"]
          ) {
            sfpowerkit_1.SFPowerkit.log(
              `located ${packageToBeScanned} in project ${sf_package["path"]}`,
              sfpowerkit_1.LoggerLevel.DEBUG
            );
            let result;
            try {
              result = yield this.validate(sf_package);
            } catch (e) {
              sfpowerkit_1.SFPowerkit.log(
                `Error Occured Unable to analyze ${sf_package["package"]}`,
                sfpowerkit_1.LoggerLevel.ERROR
              );
            }
            break;
          }
        }
      } else {
        sfpowerkit_1.SFPowerkit.log(
          "All packaging directories are  being analyzed",
          sfpowerkit_1.LoggerLevel.INFO
        );
        for (const sf_package of packageDirectories) {
          if (sf_package["package"] != undefined) {
            sfpowerkit_1.SFPowerkit.log(
              `Analyzing ${sf_package["package"]}`,
              sfpowerkit_1.LoggerLevel.DEBUG
            );
            let result;
            try {
              result = yield this.validate(sf_package);
              result_store.push(result);
            } catch (e) {
              sfpowerkit_1.SFPowerkit.log(
                `Unable to analyze ${sf_package["package"]}, Skipping ${sf_package["package"]}. try running sfdx force:source:convert -r ${sf_package["path"]}`,
                sfpowerkit_1.LoggerLevel.ERROR
              );
            }
          }
        }
      }
      if (!this.flags.json) {
        result_store.forEach((element) => {
          if (element.valid == false)
            throw new core_1.SfdxError(
              "Analysis Failed, Unsupported metadata present"
            );
        });
      }
      return { packages: result_store };
    });
  }
  validate(packageToBeScanned) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        `Utilizing Version of the metadata coverage ${this.coverageJSON.versions.selected}`,
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      sfpowerkit_1.SFPowerkit.log(
        `Converting package ${packageToBeScanned["package"]}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      var sfdx_package = new SFDXPackage();
      sfdx_package.packageName = packageToBeScanned["package"];
      yield parallel_1.sfdx.force.source.convert({
        quiet: true,
        outputdir: "temp_sfpowerkit/mdapi",
        packagename: packageToBeScanned["package"],
        rootdir: packageToBeScanned["path"],
      });
      //Bypass package validation
      if (this.flags.bypass) {
        sfdx_package.typesToBypass = this.flags.bypass;
      }
      let targetFilename = "temp_sfpowerkit/mdapi/package.xml";
      if (fs.existsSync(targetFilename)) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        const existing = yield parseString(fs.readFileSync(targetFilename));
        if (Array.isArray(existing.Package.types)) {
          for (const types of existing.Package.types) {
            if (this.coverageJSON.types[types["name"]] != undefined)
              if (
                this.coverageJSON.types[types["name"]].channels
                  .unlockedPackagingWithoutNamespace
              )
                sfdx_package.supportedTypes.push(`${types["name"]}`);
              else sfdx_package.unsupportedtypes.push(`${types["name"]}`);
          }
        } else {
          if (
            this.coverageJSON.types[existing.Package.types["name"]] != undefined
          )
            if (
              this.coverageJSON.types[existing.Package.types["name"]].channels
                .unlockedPackagingWithoutNamespace
            )
              sfdx_package.supportedTypes.push(
                `${existing.Package.types["name"]}`
              );
            else
              sfdx_package.unsupportedtypes.push(
                `${existing.Package.types["name"]}`
              );
        }
        sfdx_package.processed = true;
        if (sfdx_package.supportedTypes.length > 0) {
          this.ux.log(
            `Supported metadata in package ${packageToBeScanned["package"]}`
          );
          sfdx_package.supportedTypes.forEach((element) => {
            this.ux.log(element);
          });
          sfdx_package.valid = true;
          this.ux.log(
            `--------------------------------------------------------------------------------`
          );
        }
        //Bypass metadata in package validator
        if (
          sfdx_package.typesToBypass.length > 0 &&
          sfdx_package.unsupportedtypes.length > 0
        ) {
          let itemsToRemove = [];
          sfdx_package.typesToBypass = sfdx_package.typesToBypass.map(
            (element) => element.toLowerCase()
          );
          sfdx_package.unsupportedtypes = sfdx_package.unsupportedtypes.map(
            (element) => element.toLowerCase()
          );
          itemsToRemove = sfdx_package.typesToBypass.filter((element) =>
            sfdx_package.unsupportedtypes.includes(element)
          );
          if (itemsToRemove.length > 0) {
            this.ux.log(
              `Unsupported metadata in package ${packageToBeScanned["package"]}  to bypass`
            );
            itemsToRemove.forEach((element) => {
              this.ux.log(element);
            });
            sfdx_package.unsupportedtypes = sfdx_package.unsupportedtypes.filter(
              (element) => !itemsToRemove.includes(element)
            );
            this.ux.log(
              `--------------------------------------------------------------------------------`
            );
          }
        }
        if (sfdx_package.unsupportedtypes.length > 0) {
          this.ux.log(
            `Unsupported metadata in package ${packageToBeScanned["package"]}`
          );
          sfdx_package.unsupportedtypes.forEach((element) => {
            this.ux.log(element);
          });
          sfdx_package.valid = false;
          this.ux.log(
            `--------------------------------------------------------------------------------`
          );
        }
      }
      rimraf.sync("temp_sfpowerkit");
      return sfdx_package;
    });
  }
  useCustomCoverageJSON() {
    try {
      let resourcePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "resources",
        `metadata_v${this.flags.apiversion}.json`
      );
      let fileData = fs.readFileSync(resourcePath, "utf8");
      this.coverageJSON = JSON.parse(fileData);
    } catch (fileError) {
      throw new core_1.SfdxError(
        `Unable to read version ${this.flags.apiversion} of metadata coverage JSON`
      );
    }
  }
  isNotDefaultApiVersion() {
    return (
      this.flags.apiversion &&
      this.coverageJSON.versions.selected != this.flags.apiversion
    );
  }
}
exports.default = Valid;
Valid.description = messages.getMessage("commandDescription");
Valid.examples = [
  `$ sfdx sfpowerkit:package:valid -n testPackage
  Now analyzing testPackage
Converting package testPackage
Elements supported included in your package testPackage
[
  "AuraDefinitionBundle",
  "CustomApplication",
  "ApexClass",
  "ContentAsset",
  "WorkflowRule"
]
  `,
];
Valid.flagsConfig = {
  package: command_1.flags.string({
    required: false,
    char: "n",
    description: messages.getMessage("packageFlagDescription"),
  }),
  bypass: command_1.flags.array({
    required: false,
    char: "b",
    description: messages.getMessage("itemsToBypassValidationDescription"),
  }),
  apiversion: command_1.flags.builtin({
    description: messages.getMessage("apiversion"),
  }),
  loglevel: command_1.flags.enum({
    description: "loglevel to execute the command",
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
//protected static requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Valid.requiresProject = true;
class SFDXPackage {
  constructor() {
    this.unsupportedtypes = [];
    this.supportedTypes = [];
    this.typesToBypass = [];
  }
}
exports.SFDXPackage = SFDXPackage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9wYWNrYWdlL3ZhbGlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFHL0QsMkNBQTBEO0FBQzFELCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsNkNBQStCO0FBQy9CLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0Isb0RBQThEO0FBQzlELHFFQUE0RDtBQUM1RCx5REFBa0Q7QUFJbEQsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFbkUsTUFBcUIsS0FBTSxTQUFRLHFCQUFXO0lBZ0UvQixHQUFHOztZQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUvQix1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELHlCQUFRLEVBQUUsQ0FBQztZQUVYLHlCQUF5QjtZQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLGtCQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFNUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUU1RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUMxQixTQUFTLEVBQ1QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLFdBQVcsRUFDWCxlQUFlLENBQ2hCLENBQUM7WUFF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
