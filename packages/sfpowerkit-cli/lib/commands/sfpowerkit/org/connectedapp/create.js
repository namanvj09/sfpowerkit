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
const command_1 = require("@salesforce/command");
const fs = __importStar(require("fs-extra"));
const rimraf = __importStar(require("rimraf"));
const spawn = require("child-process-promise").spawn;
const zipDirectory_1 = require("../../../../utils/zipDirectory");
const checkDeploymentStatus_1 = require("../../../../utils/checkDeploymentStatus");
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../../sfpowerkit");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "connectedapp_create"
);
class Create extends command_1.SfdxCommand {
  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;
  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  //protected static requiresProject = true;
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.org.refreshAuth();
      //Connect to the org
      const conn = this.org.getConnection();
      const apiversion = yield conn.retrieveMaxApiVersion();
      // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
      const username = this.org.getUsername();
      const pathToCertificate = this.flags.pathtocertificate.valueOf();
      this.connectedapp_email = this.flags.email;
      this.connectedapp_label = this.flags.name;
      var certificate = fs.readFileSync(pathToCertificate).toString();
      var textblock = certificate.split("\n");
      textblock.splice(0, 1);
      textblock.splice(-2, 1);
      certificate = textblock.join("\n");
      certificate = certificate.replace(/(\r\n|\n|\r)/gm, "");
      this.connectedapp_certificate = certificate;
      this.connectedapp_consumerKey = this.createConsumerKey();
      var connectedApp_metadata = `<?xml version="1.0" encoding="UTF-8"?>
     <ConnectedApp xmlns="http://soap.sforce.com/2006/04/metadata">
         <contactEmail>${this.connectedapp_email}</contactEmail>
         <label>${this.connectedapp_label}</label>
         <oauthConfig>
             <callbackUrl>http://localhost:1717/OauthRedirect</callbackUrl>
             <certificate>${this.connectedapp_certificate}</certificate>
             <consumerKey>${this.connectedapp_consumerKey}</consumerKey>
             <scopes>Api</scopes>
             <scopes>Web</scopes>
             <scopes>RefreshToken</scopes>
         </oauthConfig>
     </ConnectedApp>`;
      var package_xml = `<?xml version="1.0" encoding="UTF-8"?>
     <Package xmlns="http://soap.sforce.com/2006/04/metadata">
         <types>
             <members>*</members>
             <name>ConnectedApp</name>
         </types>
         <version>${apiversion}</version>
     </Package>`;
      let targetmetadatapath =
        "temp_sfpowerkit/mdapi/connectedApps/" +
        this.connectedapp_label +
        ".connectedApp-meta.xml";
      fs.outputFileSync(targetmetadatapath, connectedApp_metadata);
      let targetpackagepath = "temp_sfpowerkit/mdapi/package.xml";
      fs.outputFileSync(targetpackagepath, package_xml);
      var zipFile = "temp_sfpowerkit/package.zip";
      yield zipDirectory_1.zipDirectory("temp_sfpowerkit/mdapi", zipFile);
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
        `Deploying Connected App with ID  ${
          deployId.id
        }  to ${this.org.getUsername()}`
      );
      let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
        conn,
        deployId.id
      );
      if (!metadata_deploy_result.success)
        throw new core_1.SfdxError(
          `Unable to deploy the Connected App : ${metadata_deploy_result.details["componentFailures"]["problem"]}`
        );
      this.ux.log(`Connected App Deployed`);
      rimraf.sync("temp_sfpowerkit");
      return { "connectedapp.consumerkey": this.connectedapp_consumerKey };
    });
  }
  createConsumerKey() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.";
    for (var i = 0; i < 32; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
}
exports.default = Create;
Create.description = messages.getMessage("commandDescription");
Create.examples = [
  `$ sfdx sfpowerkit:org:connectedapp:create -u myOrg@example.com -n AzurePipelines -c id_rsa -e azlam.salamm@invalid.com
  Created Connected App AzurePipelines in Target Org
  `,
];
Create.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
  }),
  pathtocertificate: command_1.flags.filepath({
    required: true,
    char: "c",
    description: messages.getMessage("certificateFlagDescription"),
  }),
  email: command_1.flags.email({
    required: true,
    char: "e",
    description: messages.getMessage("emailFlagDescription"),
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
Create.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL2Nvbm5lY3RlZGFwcC9jcmVhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBRS9ELDZDQUErQjtBQUMvQiwrQ0FBaUM7QUFFakMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELGlFQUE4RDtBQUU5RCxtRkFBZ0Y7QUFDaEYsMkNBQTZDO0FBQzdDLHVEQUFvRDtBQUVwRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1oscUJBQXFCLENBQ3RCLENBQUM7QUFFRixNQUFxQixNQUFPLFNBQVEscUJBQVc7SUFzRDdDLHVFQUF1RTtJQUN2RSxrREFBa0Q7SUFFbEQsdUdBQXVHO0lBQ3ZHLDBDQUEwQztJQUU3QixHQUFHOztZQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvQix1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUU3QixvQkFBb0I7WUFDcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRXRE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
