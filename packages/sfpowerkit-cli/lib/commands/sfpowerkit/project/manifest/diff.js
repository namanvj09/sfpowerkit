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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../../../../sfpowerkit");
const xmlUtil_1 = __importDefault(require("../../../../utils/xmlUtil"));
const getDefaults_1 = __importDefault(require("../../../../utils/getDefaults"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "project_manifest_diff"
);
class Diff extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      this.flags.apiversion =
        this.flags.apiversion || getDefaults_1.default.getApiVersion();
      if (this.flags.json) {
        this.flags.format = "json";
      }
      let sourceXml = yield this.processMainfest(this.flags.sourcepath);
      let targetXml = yield this.processMainfest(this.flags.targetpath);
      let itemsAddedInTarget = this.compareXML(sourceXml, targetXml);
      let itemsRemovedInTarget = this.compareXML(targetXml, sourceXml);
      this.output = [];
      if (itemsAddedInTarget || itemsRemovedInTarget) {
        this.addItemsToOutput(itemsAddedInTarget, "Added in Target");
        this.addItemsToOutput(itemsRemovedInTarget, "Removed in Target");
        this.output.sort(function (a, b) {
          if (a.type < b.type) {
            return -1;
          } else if (a.type > b.type) {
            return 1;
          }
          // names must be equal
          return 0;
        });
        if (this.flags.format === "xml") {
          this.createpackagexml(itemsAddedInTarget);
        } else if (this.flags.format === "csv") {
          this.generateCSVOutput(this.output);
        } else {
          fs.writeFileSync(
            `${this.flags.output}/package.json`,
            JSON.stringify(this.output)
          );
        }
      }
      return this.output;
    });
  }
  processMainfest(pathToManifest) {
    return __awaiter(this, void 0, void 0, function* () {
      let output = new Map();
      if (
        fs.existsSync(path.resolve(pathToManifest)) &&
        path.extname(pathToManifest) == ".xml"
      ) {
        let package_xml = yield xmlUtil_1.default.xmlToJSON(pathToManifest);
        let metadataTypes = package_xml.Package.types;
        if (metadataTypes.constructor === Array) {
          metadataTypes.forEach((type) => {
            if (type.members !== "*") {
              output.set(
                type.name,
                type.members.constructor === Array
                  ? type.members
                  : [type.members]
              );
            }
          });
        } else {
          if (metadataTypes.members !== "*") {
            output.set(
              metadataTypes.name,
              metadataTypes.members.constructor === Array
                ? metadataTypes.members
                : [metadataTypes.members]
            );
          }
        }
      } else {
        throw new Error(`Error : ${pathToManifest} is not valid package.xml`);
      }
      return output;
    });
  }
  compareXML(sourceXml, targetXml) {
    let metadataTypes = [];
    if (sourceXml && targetXml) {
      for (let key of targetXml.keys()) {
        if (sourceXml.has(key)) {
          const diffout = this.getdiffList(
            sourceXml.get(key),
            targetXml.get(key)
          );
          if (diffout) {
            metadataTypes.push({ name: key, members: diffout });
          }
        } else {
          metadataTypes.push({ name: key, members: targetXml.get(key) });
        }
      }
    }
    return metadataTypes;
  }
  getdiffList(from, to) {
    let output = [];
    to.forEach((item) => {
      if (!from.includes(item)) {
        output.push(item);
      }
    });
    return output;
  }
  addItemsToOutput(itemsToProcess, status) {
    itemsToProcess.forEach((metadataType) => {
      for (let item of metadataType.members) {
        this.output.push({
          status: status,
          type: metadataType.name,
          member: item,
        });
      }
    });
  }
  createpackagexml(manifest) {
    let package_xml = {
      Package: {
        $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
        types: manifest,
        version: this.flags.apiversion,
      },
    };
    fs.outputFileSync(
      `${this.flags.output}/package.xml`,
      xmlUtil_1.default.jSONToXML(package_xml)
    );
  }
  generateCSVOutput(output) {
    let newLine = "\r\n";
    let result = "status,type,member" + newLine;
    output.forEach((element) => {
      result = `${result}${element.status},${element.type},${element.member}${newLine}`;
    });
    fs.writeFileSync(`${this.flags.output}/package.csv`, result);
  }
}
exports.default = Diff;
Diff.description = messages.getMessage("commandDescription");
Diff.examples = [
  `$ sfdx sfpowerkit:project:manifest:diff -s source/package.xml -t target/package.xml -d output`,
];
Diff.flagsConfig = {
  sourcepath: command_1.flags.string({
    required: true,
    char: "s",
    description: messages.getMessage("sourcepathFlagDescription"),
  }),
  targetpath: command_1.flags.string({
    required: true,
    char: "t",
    description: messages.getMessage("targetpathFlagDescription"),
  }),
  output: command_1.flags.string({
    required: true,
    char: "d",
    description: messages.getMessage("outputFlagDescription"),
  }),
  apiversion: command_1.flags.builtin({
    description: messages.getMessage("apiversion"),
  }),
  format: command_1.flags.enum({
    required: false,
    char: "f",
    description: messages.getMessage("formatFlagDescription"),
    options: ["json", "csv", "xml"],
    default: "json",
  }),
  loglevel: command_1.flags.enum({
    description: messages.getMessage("loglevel"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3Byb2plY3QvbWFuaWZlc3QvZGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFFL0QsNkNBQStCO0FBQy9CLDJDQUE2QjtBQUM3Qix1REFBaUU7QUFDakUsd0VBQWdEO0FBQ2hELGdGQUF3RDtBQUV4RCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osdUJBQXVCLENBQ3hCLENBQUM7QUFFRixNQUFxQixJQUFLLFNBQVEscUJBQVc7SUF1RDlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLHFCQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdkQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2FBQzVCO1lBRUQsSUFBSSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEUsSUFBSSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxD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
