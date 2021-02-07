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
const fs = __importStar(require("fs-extra"));
const command_1 = require("@salesforce/command");
const rimraf = __importStar(require("rimraf"));
const core_1 = require("@salesforce/core");
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
// tslint:disable-next-line:ordered-imports
var jsforce = require("jsforce");
var path = require("path");
const checkRetrievalStatus_1 = require("../../../../utils/checkRetrievalStatus");
const checkDeploymentStatus_1 = require("../../../../utils/checkDeploymentStatus");
const extract_1 = require("../../../../utils/extract");
const zipDirectory_1 = require("../../../../utils/zipDirectory");
const sfpowerkit_1 = require("../../../../sfpowerkit");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "duplicaterule_deactivate"
);
class Deactivate extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      //Connect to the org
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      const apiversion = yield conn.retrieveMaxApiVersion();
      let retrieveRequest = {
        apiVersion: apiversion,
      };
      //Retrieve Duplicate Rule
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: { name: "DuplicateRule", members: this.flags.name },
      };
      conn.metadata.pollTimeout = 60;
      let retrievedId;
      yield conn.metadata.retrieve(retrieveRequest, function (error, result) {
        if (error) {
          return console.error(error);
        }
        retrievedId = result.id;
      });
      let metadata_retrieve_result = yield checkRetrievalStatus_1.checkRetrievalStatus(
        conn,
        retrievedId,
        !this.flags.json
      );
      if (!metadata_retrieve_result.zipFile)
        throw new core_1.SfdxError(
          "Unable to find the requested Duplicate Rule"
        );
      //Extract Duplicate Rule
      var zipFileName = "temp_sfpowerkit/unpackaged.zip";
      fs.mkdirSync("temp_sfpowerkit");
      fs.writeFileSync(zipFileName, metadata_retrieve_result.zipFile, {
        encoding: "base64",
      });
      yield extract_1.extract(
        `./temp_sfpowerkit/unpackaged.zip`,
        "temp_sfpowerkit"
      );
      fs.unlinkSync(zipFileName);
      let resultFile = `temp_sfpowerkit/duplicateRules/${this.flags.name}.duplicateRule`;
      if (fs.existsSync(path.resolve(resultFile))) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        let retrieved_duplicaterule = yield parseString(
          fs.readFileSync(path.resolve(resultFile))
        );
        this.ux.log(
          `Retrieved Duplicate Rule  with label : ${retrieved_duplicaterule.DuplicateRule.masterLabel}`
        );
        //Do Nothing if its already inactive
        if (retrieved_duplicaterule.DuplicateRule.isActive === "false") {
          this.ux.log("Already Inactive, exiting");
          return 0;
        }
        //Deactivate Rule
        this.ux.log(`Preparing Deactivation`);
        retrieved_duplicaterule.DuplicateRule.isActive = "false";
        let builder = new xml2js.Builder();
        var xml = builder.buildObject(retrieved_duplicaterule);
        fs.writeFileSync(resultFile, xml);
        var zipFile = "temp_sfpowerkit/package.zip";
        yield zipDirectory_1.zipDirectory("temp_sfpowerkit", zipFile);
        //Deploy Rule
        conn.metadata.pollTimeout = 300;
        let deployId;
        var zipStream = fs.createReadStream(zipFile);
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
        this.ux.log(
          `Deploying Deactivated Rule with ID  ${
            deployId.id
          }  to ${this.org.getUsername()}`
        );
        let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
          conn,
          deployId.id
        );
        if (!metadata_deploy_result.success)
          throw new core_1.SfdxError(
            `Unable to deploy the deactivated rule : ${metadata_deploy_result.details["componentFailures"]["problem"]}`
          );
        this.ux.log(
          `Duplicate Rule ${retrieved_duplicaterule.DuplicateRule.masterLabel} deactivated`
        );
        return 0;
      } else {
        throw new core_1.SfdxError("Duplicate Rule not found in the org");
      }
    });
  }
}
exports.default = Deactivate;
Deactivate.description = messages.getMessage("commandDescription");
Deactivate.examples = [
  `$ sfdx sfpowerkit:org:duplicaterule:deactivate -n Account.CRM_Account_Rule_1 -u sandbox
    Polling for Retrieval Status
    Retrieved Duplicate Rule  with label : CRM Account Rule 2
    Preparing Deactivation
    Deploying Deactivated Rule with ID  0Af4Y000003OdTWSA0
    Polling for Deployment Status
    Polling for Deployment Status
    Duplicate Rule CRM Account Rule 2 deactivated
  `,
];
Deactivate.flagsConfig = {
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
Deactivate.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVhY3RpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L29yZy9kdXBsaWNhdGVydWxlL2RlYWN0aXZhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsNkNBQStCO0FBQy9CLGlEQUErRDtBQUMvRCwrQ0FBaUM7QUFHakMsMkNBQTZDO0FBQzdDLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsMkNBQTJDO0FBQzNDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFM0IsaUZBQThFO0FBQzlFLG1GQUFnRjtBQUNoRix1REFBb0Q7QUFDcEQsaUVBQThEO0FBQzlELHVEQUFvRDtBQUVwRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osMEJBQTBCLENBQzNCLENBQUM7QUFFRixNQUFxQixVQUFXLFNBQVEscUJBQVc7SUE4Q3BDLEdBQUc7O1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9CLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0Qsb0JBQW9CO1lBQ3BCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lB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
