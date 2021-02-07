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
  "duplicaterule_activate"
);
class Activate extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      rimraf.sync("temp_sfpowerkit");
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
        //Do Nothing if its already Active
        if (retrieved_duplicaterule.DuplicateRule.isActive === "true") {
          this.ux.log("Already Active, exiting");
          return 1;
        }
        //Deactivate Rule
        this.ux.log(`Preparing Activation`);
        retrieved_duplicaterule.DuplicateRule.isActive = "true";
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
          `Deploying Activated Rule with ID  ${
            deployId.id
          }  to ${this.org.getUsername()}`
        );
        let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
          conn,
          deployId.id
        );
        if (!metadata_deploy_result.success)
          throw new core_1.SfdxError(
            `Unable to deploy the Activated rule : ${metadata_deploy_result.details["componentFailures"]["problem"]}`
          );
        this.ux.log(
          `Duplicate Rule ${retrieved_duplicaterule.DuplicateRule.masterLabel} Activated`
        );
        return 0;
      } else {
        throw new core_1.SfdxError("Duplicate Rule not found in the org");
      }
    });
  }
}
exports.default = Activate;
Activate.description = messages.getMessage("commandDescription");
Activate.examples = [
  `$ sfdx sfpowerkit:org:duplicaterule:Activate -n Account.CRM_Account_Rule_1 -u sandbox
    Polling for Retrieval Status
    Retrieved Duplicate Rule  with label : CRM Account Rule 2
    Preparing Activation
    Deploying Activated Rule with ID  0Af4Y000003OdTWSA0
    Polling for Deployment Status
    Polling for Deployment Status
    Duplicate Rule CRM Account Rule 2 Activated
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvZHVwbGljYXRlcnVsZS9hY3RpdmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw2Q0FBK0I7QUFDL0IsaURBQStEO0FBQy9ELCtDQUFpQztBQUdqQywyQ0FBNkM7QUFDN0MsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUM3QiwyQ0FBMkM7QUFDM0MsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixpRkFBOEU7QUFDOUUsbUZBQWdGO0FBQ2hGLHVEQUFvRDtBQUNwRCxpRUFBOEQ7QUFDOUQsdURBQW9EO0FBRXBELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix3QkFBd0IsQ0FDekIsQ0FBQztBQUVGLE1BQXFCLFFBQVMsU0FBUSxxQkFBVztJQThDbEMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUvQixvQkFBb0I7WUFDcEIsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEMs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
