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
const zipDirectory_1 = require("../../../../utils/zipDirectory");
const checkDeploymentStatus_1 = require("../../../../utils/checkDeploymentStatus");
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../../sfpowerkit");
const spawn = require("child-process-promise").spawn;
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "source_customlabel_create"
);
class Create extends command_1.SfdxCommand {
  constructor() {
    super(...arguments);
    this.customlabel_language = "en_US";
    this.customlabel_protected = false;
  }
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      // Gives first value in url after https protocol
      const packageName = this.flags.package;
      this.customlabel_fullname = this.flags.ignorepackage
        ? this.flags.fullname
        : `${packageName}_${this.flags.fullname}`;
      this.customlabel_value = this.flags.value;
      this.customlabel_categories = this.flags.categories || null;
      this.customlabel_language =
        this.flags.language || this.customlabel_language;
      this.customlabel_protected =
        this.flags.language || this.customlabel_protected;
      this.customlabel_shortdescription = this.flags.shortdescription;
      var customlabels_metadata = `<?xml version="1.0" encoding="UTF-8"?>
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
    <labels>
        <fullName>${this.customlabel_fullname}</fullName>${
        this.customlabel_categories != null
          ? `\n<categories>${this.customlabel_categories}</categories>`
          : ""
      }
        <shortDescription>${
          this.customlabel_shortdescription
        }</shortDescription>
        <language>${this.customlabel_language}</language>
        <protected>${this.customlabel_protected.toString()}</protected>
        <value>${this.customlabel_value}</value>
    </labels>
</CustomLabels>`;
      var package_xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>CustomLabel</name>
    </types>
    <version>${this.flags.apiversion}</version>
</Package>`;
      let targetmetadatapath =
        "temp_sfpowerkit/mdapi/labels/CustomLabels.labels-meta.xml";
      fs.outputFileSync(targetmetadatapath, customlabels_metadata);
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
        `Deploying Custom Label with ID  ${
          deployId.id
        } to ${this.org.getUsername()}`
      );
      let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
        conn,
        deployId.id
      );
      if (metadata_deploy_result.success) {
        if (!this.flags.ignorepackage)
          this.ux.log(
            `Deployed  Custom Label ${this.customlabel_fullname} in target org with ${this.flags.package}_  prefix, You may now pull and utilize the customlabel:reconcile command `
          );
        else if (metadata_deploy_result.success)
          this.ux.log(
            `Deployed  Custom Label ${this.customlabel_fullname} in target org`
          );
      } else {
        throw new core_1.SfdxError(
          `Unable to deploy the Custom Label: ${metadata_deploy_result.details["componentFailures"]["problem"]}`
        );
      }
      rimraf.sync("temp_sfpowerkit");
      return {
        "customlabel.fullname": this.customlabel_fullname,
      };
    });
  }
}
exports.default = Create;
Create.description = messages.getMessage("commandDescription");
Create.examples = [
  `$ sfdx sfpowerkit:source:customlabel:create -u fancyScratchOrg1 -n FlashError -v "Memory leaks aren't for the faint hearted" -s "A flashing error --package core"
  Deployed CustomLabel FlashError in target org with core_  prefix, You may now pull and utilize the customlabel:reconcile command
  `,
];
Create.flagsConfig = {
  fullname: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("fullnameFlagDescription"),
  }),
  value: command_1.flags.string({
    required: true,
    char: "v",
    description: messages.getMessage("valueFlagDescription"),
  }),
  categories: command_1.flags.string({
    required: false,
    char: "c",
    description: messages.getMessage("categoriesFlagDescription"),
  }),
  language: command_1.flags.string({
    required: false,
    char: "l",
    description: messages.getMessage("languageFlagDescription"),
  }),
  protected: command_1.flags.string({
    required: false,
    char: "p",
    description: messages.getMessage("protectedFlagDescription"),
  }),
  shortdescription: command_1.flags.string({
    required: true,
    char: "s",
    description: messages.getMessage("shortdescriptionFlagDescription"),
  }),
  package: command_1.flags.string({
    required: false,
    description: messages.getMessage("packageFlagDescription"),
  }),
  ignorepackage: command_1.flags.boolean({
    char: "i",
    default: false,
    description: messages.getMessage("ignorepackageFlagDescription"),
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
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Create.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvc291cmNlL2N1c3RvbWxhYmVsL2NyZWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFFL0QsNkNBQStCO0FBQy9CLCtDQUFpQztBQUNqQyxpRUFBOEQ7QUFFOUQsbUZBQWdGO0FBQ2hGLDJDQUE2QztBQUM3Qyx1REFBb0Q7QUFFcEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXJELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWiwyQkFBMkIsQ0FDNUIsQ0FBQztBQUVGLE1BQXFCLE1BQU8sU0FBUSxxQkFBVztJQUEvQzs7UUFHUyx5QkFBb0IsR0FBVyxPQUFPLENBQUM7UUFDdkMsMEJBQXFCLEdBQVksS0FBSyxDQUFDO0lBK0xoRCxDQUFDO0lBN0djLEdBQUc7O1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9CLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMs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
