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
  "matchingrule_deactivate"
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
        types: { name: "MatchingRules", members: this.flags.name },
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
        if (
          ts_types_1.isJsonArray(
            retrieve_matchingRule.MatchingRules.matchingRules
          )
        ) {
          retrieve_matchingRule.MatchingRules.matchingRules.forEach(
            (element) => {
              element.ruleStatus = "Inactive";
            }
          );
        } else {
          if (
            !util.isNullOrUndefined(
              retrieve_matchingRule.MatchingRules.matchingRules
            )
          )
            retrieve_matchingRule.MatchingRules.matchingRules.ruleStatus =
              "Inactive";
          else {
            throw new core_1.SfdxError(
              "No Custom Matching Rule  found in the org"
            );
          }
        }
        //Deactivate Rule
        this.ux.log(`Preparing Deactivation`);
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
          `Deploying Deactivated Matching Rule with ID  ${
            deployId.id
          }  to ${this.org.getUsername()}`
        );
        let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
          conn,
          deployId.id
        );
        if (!metadata_deploy_result.success)
          throw new core_1.SfdxError(
            `Unable to deploy the deactivated matching rule : ${metadata_deploy_result.details["componentFailures"]["problem"]}`
          );
        this.ux.log(`Matching Rule for ${this.flags.name} deactivated`);
        return 0;
      } else {
        throw new core_1.SfdxError("Matching Rule not found in the org");
      }
    });
  }
}
exports.default = Deactivate;
Deactivate.description = messages.getMessage("commandDescription");
Deactivate.examples = [
  `$ sfdx sfpowerkit:org:matchingrules:deactivate -n Account -u sandbox
    Polling for Retrieval Status
    Retrieved Matching Rule  for Object : Account
    Preparing Deactivation
    Deploying Deactivated Rule with ID  0Af4Y000003OdTWSA0
    Polling for Deployment Status
    Polling for Deployment Status
    Matching Rule for  Account deactivated
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVhY3RpdmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L29yZy9tYXRjaGluZ3J1bGUvZGVhY3RpdmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBNEQ7QUFDNUQsNkNBQStCO0FBQy9CLGlEQUErRDtBQUMvRCwrQ0FBaUM7QUFFakMsMkNBQTZDO0FBQzdDLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsMkNBQTJDO0FBQzNDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsaUZBQThFO0FBQzlFLG1GQUFnRjtBQUNoRix1REFBb0Q7QUFDcEQsaUVBQThEO0FBQzlELHVEQUFvRDtBQUVwRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1oseUJBQXlCLENBQzFCLENBQUM7QUFFRixNQUFxQixVQUFXLFNBQVEscUJBQVc7SUE4Q3BDLEdBQUc7O1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9CLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0Qsb0JBQW9CO1lBQ3BCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEs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
