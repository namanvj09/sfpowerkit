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
const fs_extra_1 = __importDefault(require("fs-extra"));
const command_1 = require("@salesforce/command");
const rimraf = require("rimraf");
const core_1 = require("@salesforce/core");
// tslint:disable-next-line:ordered-imports
var path = require("path");
const checkRetrievalStatus_1 = require("../../../utils/checkRetrievalStatus");
const checkDeploymentStatus_1 = require("../../../utils/checkDeploymentStatus");
const extract_1 = require("../../../utils/extract");
const sfpowerkit_1 = require("../../../sfpowerkit");
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "package_applypatch"
);
class Applypatch extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      this.folderPath = `temp_sfpowerkit_${fileutils_1.default.makefolderid(
        5
      )}`;
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      //Connect to the org
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      const apiversion = yield conn.retrieveMaxApiVersion();
      let retrieveRequest = {
        apiVersion: apiversion,
      };
      //Retrieve Static  Resource
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: { name: "StaticResource", members: this.flags.name },
      };
      conn.metadata.pollTimeout = 60;
      let retrievedId;
      yield conn.metadata.retrieve(retrieveRequest, function (error, result) {
        if (error) {
          return console.error(error);
        }
        retrievedId = result.id;
      });
      //Retrieve Patch
      let metadata_retrieve_result = yield checkRetrievalStatus_1.checkRetrievalStatus(
        conn,
        retrievedId,
        !this.flags.json
      );
      if (!metadata_retrieve_result.zipFile)
        throw new core_1.SfdxError(
          "Unable to find the requested Static Resource"
        );
      var zipFileName = `${this.folderPath}/unpackaged.zip`;
      fs_extra_1.default.mkdirSync(this.folderPath);
      fs_extra_1.default.writeFileSync(
        zipFileName,
        metadata_retrieve_result.zipFile,
        {
          encoding: "base64",
        }
      );
      if (fs_extra_1.default.existsSync(path.resolve(zipFileName))) {
        yield extract_1.extract(
          `./${this.folderPath}/unpackaged.zip`,
          this.folderPath
        );
        fs_extra_1.default.unlinkSync(zipFileName);
        let resultFile = `${this.folderPath}/staticresources/${this.flags.name}.resource`;
        if (fs_extra_1.default.existsSync(path.resolve(resultFile))) {
          sfpowerkit_1.SFPowerkit.log(
            `Preparing Patch ${this.flags.name}`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          fs_extra_1.default.copyFileSync(
            resultFile,
            `${this.folderPath}/unpackaged.zip`
          );
          //Deploy patch using mdapi
          conn.metadata.pollTimeout = 300;
          let deployId;
          var zipStream = fs_extra_1.default.createReadStream(zipFileName);
          yield conn.metadata.deploy(
            zipStream,
            { rollbackOnError: true, singlePackage: true },
            function (error, result) {
              if (error) {
                return console.error(error);
              }
              deployId = result;
            }
          );
          sfpowerkit_1.SFPowerkit.log(
            `Deploying Patch with ID  ${
              deployId.id
            } to ${this.org.getUsername()}`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
            conn,
            deployId.id
          );
          if (!metadata_deploy_result.success) {
            let componentFailures =
              metadata_deploy_result.details["componentFailures"];
            throw new core_1.SfdxError(
              `Unable to deploy the Patch : ${JSON.stringify(
                componentFailures
              )}`
            );
          }
          sfpowerkit_1.SFPowerkit.log(
            `Patch ${this.flags.name} Deployed successfully.`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          rimraf.sync(this.folderPath);
          return 1;
        } else {
          sfpowerkit_1.SFPowerkit.log(
            `Patch ${this.flags.name} not found in the org`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          rimraf.sync(this.folderPath);
        }
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `Patch ${this.flags.name} not found in the org`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        rimraf.sync(this.folderPath);
      }
    });
  }
}
exports.default = Applypatch;
Applypatch.description = messages.getMessage("commandDescription");
Applypatch.examples = [
  `$ sfdx sfpowerkit:package:applypatch -n customer_picklist -u sandbox`,
];
Applypatch.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
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
Applypatch.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlwYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3BhY2thZ2UvYXBwbHlwYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdEQUEwQjtBQUMxQixpREFBK0Q7QUFDL0QsaUNBQWtDO0FBRWxDLDJDQUE2QztBQUM3QywyQ0FBMkM7QUFDM0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLDhFQUEyRTtBQUMzRSxnRkFBNkU7QUFDN0Usb0RBQWlEO0FBQ2pELG9EQUE4RDtBQUM5RCx5RUFBaUQ7QUFFakQsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUVoRixNQUFxQixVQUFXLFNBQVEscUJBQVc7SUFxQ3BDLEdBQUc7O1lBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsbUJBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNqRSx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELG9CQUFvQjtZQUNwQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRXRELElBQUksZUFBZSxHQUFH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
