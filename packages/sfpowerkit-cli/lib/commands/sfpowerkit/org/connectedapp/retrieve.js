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
const extract_1 = require("../../../../utils/extract");
const getDefaults_1 = __importDefault(require("../../../../utils/getDefaults"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "connectedapp_retrieve"
);
class Retrieve extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      let retrieveRequest = {
        apiVersion: getDefaults_1.default.getApiVersion(),
      };
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: { name: "ConnectedApp", members: this.flags.name },
      };
      // if(!this.flags.json)
      // this.ux.logJson(retrieveRequest);
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      retrieveRequest.apiVersion = this.flags.apiversion;
      conn.metadata.pollTimeout = 60;
      let retrievedId;
      yield conn.metadata.retrieve(retrieveRequest, function (error, result) {
        if (error) {
          return console.error(error);
        }
        retrievedId = result.id;
      });
      // if(!this.flags.json)
      // console.log(retrievedId);
      let metadata_retrieve_result = yield checkRetrievalStatus_1.checkRetrievalStatus(
        conn,
        retrievedId,
        !this.flags.json
      );
      if (!metadata_retrieve_result.zipFile)
        throw new core_1.SfdxError("Unable to find the requested ConnectedApp");
      var zipFileName = "temp_sfpowerkit/unpackaged.zip";
      fs.mkdirSync("temp_sfpowerkit");
      fs.writeFileSync(zipFileName, metadata_retrieve_result.zipFile, {
        encoding: "base64",
      });
      yield extract_1.extract(
        `./temp_sfpowerkit/unpackaged.zip`,
        "temp_sfpowerkit"
      );
      let resultFile = `temp_sfpowerkit/connectedApps/${this.flags.name}.connectedApp`;
      // if(!this.flags.json)
      // this.ux.log(`Checking for file ${resultFile}`);
      // this.ux.log(path.resolve(resultFile));
      let retrieved_connectedapp;
      if (fs.existsSync(path.resolve(resultFile))) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        retrieved_connectedapp = yield parseString(
          fs.readFileSync(path.resolve(resultFile))
        );
        // if(!this.flags.json)
        // this.ux.logJson(retrieved_connectedapp);
        this.ux.log(
          `Retrieved ConnectedApp Succesfully  with Consumer Key : ${retrieved_connectedapp.ConnectedApp.oauthConfig.consumerKey}`
        );
        return { connectedapp: retrieved_connectedapp.ConnectedApp };
      } else {
        throw new core_1.SfdxError("Unable to process");
      }
    });
  }
}
exports.default = Retrieve;
Retrieve.description = messages.getMessage("commandDescription");
Retrieve.examples = [
  `$ sfdx sfpowerkit:org:connectedapp:retrieve -n AzurePipelines -u azlam@sfdc.com 
  Retrived AzurePipelines Consumer Key : XSD21Sd23123w21321
  `,
];
// Comment this out if your command does not require an org username
Retrieve.requiresUsername = true;
Retrieve.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
  }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0cmlldmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvY29ubmVjdGVkYXBwL3JldHJpZXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDZDQUErQjtBQUMvQixpREFBK0Q7QUFDL0QsK0NBQWlDO0FBRWpDLDJDQUE2QztBQUM3QywrQ0FBaUM7QUFDakMsMkNBQTZCO0FBQzdCLDJDQUEyQztBQUMzQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLGlGQUE4RTtBQUM5RSx1REFBb0Q7QUFDcEQsZ0ZBQXdEO0FBRXhELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix1QkFBdUIsQ0FDeEIsQ0FBQztBQUVGLE1BQXFCLFFBQVMsU0FBUSxxQkFBVztJQXFCbEMsR0FBRzs7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsSUFBSSxlQUFlLEdBQUc7Z0JBQ3BCLFVBQVUsRUFBRSxxQkFBVyxDQUFDLGFBQWEsRUFBRTthQUN4QyxDQUFDO1lBRUYsZUFBZSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN4QyxlQUFlLENBQUMsWUFBWSxDQUFDLEdBQUc7Z0JBQzlCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO2FBQzFELENBQUM7WUFF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
