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
const ts_types_1 = require("@salesforce/ts-types");
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
  "matchingrule_activate"
);
class Activate extends command_1.SfdxCommand {
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
      //Retrieve Matching Rule
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: { name: "MatchingRules", members: this.flags.name },
      };
      conn.metadata.pollTimeout = 600000;
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
          "Unable to find the requested Matching Rule"
        );
      //Extract Matching Rule
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
      let resultFile = `temp_sfpowerkit/matchingRules/${this.flags.name}.matchingRule`;
      if (fs.existsSync(path.resolve(resultFile))) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        let retrieve_matchingRule = yield parseString(
          fs.readFileSync(path.resolve(resultFile))
        );
        this.ux.log(`Retrieved Matching Rule  for Object : ${this.flags.name}`);
        //Deactivate Rule
        this.ux.log(`Preparing Activation`);
        if (
          ts_types_1.isJsonArray(
            retrieve_matchingRule.MatchingRules.matchingRules
          )
        ) {
          retrieve_matchingRule.MatchingRules.matchingRules.forEach(
            (element) => {
              element.ruleStatus = "Active";
            }
          );
        } else {
          retrieve_matchingRule.MatchingRules.matchingRules.ruleStatus =
            "Active";
        }
        let builder = new xml2js.Builder();
        var xml = builder.buildObject(retrieve_matchingRule);
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
          `Deploying Activated Matching Rule with ID  ${
            deployId.id
          }  to ${this.org.getUsername()}`
        );
        let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
          conn,
          deployId.id
        );
        if (!metadata_deploy_result.success)
          throw new core_1.SfdxError(
            `Unable to deploy the activated matching rule: ${metadata_deploy_result.details["componentFailures"]["problem"]}`
          );
        this.ux.log(`Matching Rule for ${this.flags.name} activated`);
        return 1;
      } else {
        throw new core_1.SfdxError("Matching Rule not found in the org");
      }
    });
  }
}
exports.default = Activate;
Activate.description = messages.getMessage("commandDescription");
Activate.examples = [
  `$ sfdx sfpowerkit:org:matchingrules:activate -n Account -u sandbox
    Polling for Retrieval Status
    Retrieved Matching Rule  for Object : Account
    Preparing Activation
    Deploying Activated Rule with ID  0Af4Y000003OdTWSA0
    Polling for Deployment Status
    Polling for Deployment Status
    Matching Rule for  Account activated
  `,
];
Activate.flagsConfig = {
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
Activate.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvbWF0Y2hpbmdydWxlL2FjdGl2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUE0RDtBQUM1RCw2Q0FBK0I7QUFDL0IsaURBQStEO0FBQy9ELCtDQUFpQztBQUVqQywyQ0FBNkM7QUFDN0MsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUM3QiwyQ0FBMkM7QUFDM0MsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixpRkFBOEU7QUFDOUUsbUZBQWdGO0FBQ2hGLHVEQUFvRDtBQUNwRCxpRUFBOEQ7QUFDOUQsdURBQW9EO0FBRXBELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix1QkFBdUIsQ0FDeEIsQ0FBQztBQUVGLE1BQXFCLFFBQVMsU0FBUSxxQkFBVztJQThDbEMsR0FBRzs7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxvQkFBb0I7WUFDcEIsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFF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
