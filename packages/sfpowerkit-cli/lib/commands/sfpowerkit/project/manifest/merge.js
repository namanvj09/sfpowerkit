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
  "project_manifest_merge"
);
class Merge extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      this.output = new Map();
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      this.flags.apiversion =
        this.flags.apiversion || getDefaults_1.default.getApiVersion();
      let paths = [];
      if (this.flags.path.constructor === Array) {
        paths = this.flags.path;
      } else {
        paths.push(this.flags.path);
      }
      for (const dir of paths) {
        if (fs.existsSync(path.resolve(dir)) && path.extname(dir) == ".xml") {
          yield this.processMainfest(dir);
        } else {
          throw new Error(`Error : ${dir} is not valid package.xml`);
        }
      }
      let metadataTypes = [];
      for (let [key, value] of this.output) {
        metadataTypes.push({ name: key, members: value });
      }
      if (metadataTypes) {
        this.createpackagexml(metadataTypes);
      }
      if (!this.flags.json) {
        let tableout = [];
        metadataTypes.forEach((metadataType) => {
          for (let item of metadataType.members) {
            tableout.push({ type: metadataType.name, member: item });
          }
        });
        this.ux.table(tableout, ["type", "member"]);
      }
      return metadataTypes;
    });
  }
  processMainfest(dir) {
    return __awaiter(this, void 0, void 0, function* () {
      let package_xml = yield xmlUtil_1.default.xmlToJSON(dir);
      let metadataTypes = package_xml.Package.types;
      if (metadataTypes.constructor === Array) {
        for (const item of metadataTypes) {
          if (item.members.constructor === Array) {
            this.setOutput(item.name, item.members);
          } else {
            this.setOutput(item.name, [item.members]);
          }
        }
      } else {
        if (metadataTypes.members.constructor === Array) {
          this.setOutput(metadataTypes.name, metadataTypes.members);
        } else {
          this.setOutput(metadataTypes.name, [metadataTypes.members]);
        }
      }
    });
  }
  setOutput(key, values) {
    let currentItems = this.output.get(key) || [];
    values.forEach((item) => {
      if (!currentItems.includes(item)) {
        currentItems.push(item);
      }
    });
    this.output.set(key, currentItems);
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
      `${this.flags.manifest}/package.xml`,
      xmlUtil_1.default.jSONToXML(package_xml)
    );
  }
}
exports.default = Merge;
Merge.description = messages.getMessage("commandDescription");
Merge.examples = [
  `$ sfdx sfpowerkit:project:manifest:merge -p project1/path/to/package.xml -d result/package.xml\n` +
    `$ sfdx sfpowerkit:project:manifest:merge -p project1/path/to/package.xml,project2/path/to/package.xml -d result/package.xml`,
];
Merge.flagsConfig = {
  path: command_1.flags.array({
    required: true,
    char: "p",
    description: messages.getMessage("pathFlagDescription"),
  }),
  manifest: command_1.flags.string({
    required: true,
    char: "d",
    description: messages.getMessage("manifestFlagDescription"),
  }),
  apiversion: command_1.flags.builtin({
    description: messages.getMessage("apiversion"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9wcm9qZWN0L21hbmlmZXN0L21lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUUvRCw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLHVEQUFpRTtBQUNqRSx3RUFBZ0Q7QUFDaEQsZ0ZBQXdEO0FBRXhELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix3QkFBd0IsQ0FDekIsQ0FBQztBQUVGLE1BQXFCLEtBQU0sU0FBUSxxQkFBVztJQTZDL0IsR0FBRzs7WUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBQzFDLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxxQkFBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLEtBQUssRUFBRTtnQkFDekMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJ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
