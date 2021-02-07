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
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const xml2js = __importStar(require("xml2js"));
const rimraf = __importStar(require("rimraf"));
const util = __importStar(require("util"));
const zipDirectory_1 = require("../../../utils/zipDirectory");
const checkDeploymentStatus_1 = require("../../..//utils/checkDeploymentStatus");
const core_1 = require("@salesforce/core");
const fs = __importStar(require("fs-extra"));
const kit_1 = require("@salesforce/kit");
const path = require("path");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "org_destruct"
);
class Destruct extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.org.refreshAuth();
      //Connect to the org
      const conn = this.org.getConnection();
      const apiversion = yield conn.retrieveMaxApiVersion();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      const existingManifestPath = this.flags.manifest.valueOf();
      let workingDirectory = this.generateCacheDirectory();
      try {
        yield this.copyAndValidateDestructiveManifest(
          existingManifestPath,
          workingDirectory
        );
        this.generateEmptyPackageXml(workingDirectory, apiversion);
        let zipFile = yield this.generateDeploymentZipFile(workingDirectory);
        yield this.deployDestructiveManifest(zipFile, conn);
      } catch (e) {
        throw new core_1.SfdxError(e.message);
      }
      rimraf.sync(workingDirectory);
      return 0;
    });
  }
  generateCacheDirectory() {
    //Setup working directory
    let cacheDirectory = fileutils_1.default.getGlobalCacheDir();
    let destructCacheDirectory = path.join(cacheDirectory, "destruct");
    //Clean existing directory
    rimraf.sync(destructCacheDirectory);
    fs.mkdirSync(destructCacheDirectory);
    return destructCacheDirectory;
  }
  copyAndValidateDestructiveManifest(existingManifestPath, workingDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
      let destructiveManifestFile = path.join(
        workingDirectory,
        "destructiveChanges.xml"
      );
      //Copy Destructive Manifest File to  Temporary Directory
      fs.copyFileSync(existingManifestPath, destructiveManifestFile);
      //Validate the destructive file for syntax
      const parser = new xml2js.Parser({ explicitArray: false });
      const parseString = util.promisify(parser.parseString);
      let destructiveChanges = yield parseString(
        fs.readFileSync(path.resolve(destructiveManifestFile))
      );
      if (kit_1.isEmpty(destructiveChanges["Package"]["types"])) {
        throw new core_1.SfdxError(
          "Invalid Destructive Change Definitiion Encountered"
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        destructiveChanges["Package"]["types"],
        sfpowerkit_1.LoggerLevel.TRACE
      );
    });
  }
  generateEmptyPackageXml(workingDirectory, apiversion) {
    let packageXml = `<?xml version="1.0" encoding="UTF-8"?>
    <Package xmlns="http://soap.sforce.com/2006/04/metadata">
        <types>
            <members>*</members>
            <name>CustomLabel</name>
        </types>
        <version>${apiversion}</version>
    </Package>`;
    let packageXmlPath = path.join(workingDirectory, "package.xml");
    fs.outputFileSync(packageXmlPath, packageXml);
    sfpowerkit_1.SFPowerkit.log(
      `Empty Package.xml with ${apiversion} created at ${workingDirectory}`,
      sfpowerkit_1.LoggerLevel.DEBUG
    );
  }
  generateDeploymentZipFile(workingDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
      let zipFile = path.join(
        fileutils_1.default.getGlobalCacheDir(),
        "package.zip"
      );
      yield zipDirectory_1.zipDirectory(workingDirectory, zipFile);
      return zipFile;
    });
  }
  deployDestructiveManifest(zipFile, conn) {
    return __awaiter(this, void 0, void 0, function* () {
      //Deploy Package
      conn.metadata.pollTimeout = 300;
      let deployId;
      var zipStream = fs.createReadStream(zipFile);
      yield conn.metadata.deploy(
        zipStream,
        { rollbackOnError: true, singlePackage: true },
        function (error, result) {
          if (error) {
            sfpowerkit_1.SFPowerkit.log(
              error.message,
              sfpowerkit_1.LoggerLevel.ERROR
            );
          }
          deployId = result;
        }
      );
      sfpowerkit_1.SFPowerkit.log(
        `Deploying Destructive Changes with ID ${
          deployId.id
        } to ${this.org.getUsername()}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
        conn,
        deployId.id
      );
      if (metadata_deploy_result.success) {
        if (metadata_deploy_result.success)
          sfpowerkit_1.SFPowerkit.log(
            `Deployed Destructive Changes  in target org ${this.org.getUsername()} succesfully`,
            sfpowerkit_1.LoggerLevel.INFO
          );
      } else {
        let componentFailures =
          metadata_deploy_result.details["componentFailures"];
        let errorResult = [];
        if (componentFailures.constructor === Array) {
          componentFailures.forEach((failure) => {
            errorResult.push({
              componentType: failure.componentType,
              fullName: failure.fullName,
              problem: failure.problem,
            });
          });
        } else {
          errorResult.push({
            componentType: componentFailures.componentType,
            fullName: componentFailures.fullName,
            problem: componentFailures.problem,
          });
        }
        throw new core_1.SfdxError(
          "Unable to deploy the Destructive Changes: " +
            JSON.stringify(errorResult)
        );
      }
    });
  }
}
exports.default = Destruct;
Destruct.description = messages.getMessage("commandDescription");
Destruct.examples = [
  `$ sfdx sfpowerkit:org:destruct -m destructiveChanges.xml -u prod@prod3.com`,
];
Destruct.flagsConfig = {
  manifest: command_1.flags.filepath({
    required: false,
    char: "m",
    description: messages.getMessage("destructiveManifestFlagDescription"),
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
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
// protected static requiresProject = true;
// Comment this out if your command does not require an org username
Destruct.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvZGVzdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTRFO0FBQzVFLHlFQUFpRDtBQUNqRCxvREFBOEQ7QUFDOUQsK0NBQWlDO0FBQ2pDLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsOERBQTJEO0FBRTNELGlGQUE4RTtBQUM5RSwyQ0FBNkM7QUFDN0MsNkNBQStCO0FBQy9CLHlDQUEwQztBQUUxQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFN0Isd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFMUUsTUFBcUIsUUFBUyxTQUFRLHFCQUFXO0lBd0NsQyxHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTdCLG9CQUFvQjtZQUNwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFD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
