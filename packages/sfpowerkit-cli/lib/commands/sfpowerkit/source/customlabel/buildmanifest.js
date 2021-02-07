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
  "source_customlabel_buildmanifest"
);
class Buildmanifest extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      this.flags.apiversion =
        this.flags.apiversion || getDefaults_1.default.getApiVersion();
      let paths = [];
      if (this.flags.path.constructor === Array) {
        paths = this.flags.path;
      } else {
        paths.push(this.flags.path);
      }
      this.output = [];
      for (const element of paths) {
        if (
          fs.existsSync(path.resolve(element)) &&
          (element.endsWith("CustomLabels.labels") ||
            element.endsWith("CustomLabels.labels-meta.xml"))
        ) {
          yield this.getlabels(element);
        } else {
          throw new Error(`Error : ${element} is not valid custom label file`);
        }
      }
      this.flags.manifest = yield this.validatepackagexml(this.flags.manifest);
      yield this.setlabels(this.flags.manifest);
      if (!this.flags.json) {
        let result = [];
        for (let i = 0; i < this.output.length; i++) {
          result.push({ sno: i + 1, label: this.output[i] });
        }
        this.ux.table(result, ["sno", "label"]);
      }
      return this.output;
    });
  }
  setoutput(label) {
    if (!this.output.includes(label) && label !== "*") {
      this.output.push(label);
    }
  }
  getlabels(labelpath) {
    return __awaiter(this, void 0, void 0, function* () {
      let retrieved_customlabels = yield xmlUtil_1.default.xmlToJSON(labelpath);
      let labels = retrieved_customlabels.CustomLabels.labels;
      if (labels.constructor === Array) {
        labels.forEach((label) => {
          this.setoutput(label.fullName);
        });
      } else {
        this.setoutput(labels.fullName);
      }
    });
  }
  validatepackagexml(manifest) {
    return __awaiter(this, void 0, void 0, function* () {
      let fileOrFolder = path.normalize(manifest);
      if (fs.existsSync(fileOrFolder)) {
        let stats = fs.statSync(fileOrFolder);
        if (stats.isFile()) {
          if (path.extname(fileOrFolder) != ".xml") {
            throw new Error(`Error : ${fileOrFolder} is not valid package.xml`);
          } else {
            yield this.checklabelspackagexml(manifest);
          }
        } else if (stats.isDirectory()) {
          manifest = `${manifest}/package.xml`;
          this.createpackagexml(manifest);
        }
      } else {
        manifest = manifest.endsWith(`package.xml`)
          ? `${manifest}`
          : `${manifest}/package.xml`;
        this.createpackagexml(manifest);
      }
      return manifest;
    });
  }
  createpackagexml(manifest) {
    var package_xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
      <members>*</members>
      <name>CustomLabel</name>
  </types>
  <version>${this.flags.apiversion}</version>
</Package>`;
    fs.outputFileSync(manifest, package_xml);
  }
  checklabelspackagexml(manifest) {
    return __awaiter(this, void 0, void 0, function* () {
      let package_xml = yield xmlUtil_1.default.xmlToJSON(manifest);
      let isLabelexist = false;
      if (package_xml.Package.types.constructor === Array) {
        for (const item of package_xml.Package.types) {
          if (item.name === "CustomLabel") {
            this.setlabelutil(item.members);
            item.members = "*";
            isLabelexist = true;
            break;
          }
        }
      } else if (package_xml.Package.types.name === "CustomLabel") {
        this.setlabelutil(package_xml.Package.types.members);
        package_xml.Package.types.members = "*";
        isLabelexist = true;
      }
      if (!isLabelexist) {
        let label = { name: "CustomLabel", members: "*" };
        package_xml.Package.types.push(label);
      }
      fs.outputFileSync(manifest, xmlUtil_1.default.jSONToXML(package_xml));
    });
  }
  setlabelutil(members) {
    if (members.constructor === Array) {
      for (const label of members) {
        this.setoutput(label);
      }
    } else {
      this.setoutput(members);
    }
  }
  setlabels(manifest) {
    return __awaiter(this, void 0, void 0, function* () {
      let package_xml = yield xmlUtil_1.default.xmlToJSON(manifest);
      if (package_xml.Package.types.constructor === Array) {
        for (const item of package_xml.Package.types) {
          if (item.name === "CustomLabel") {
            item.members = this.output;
            break;
          }
        }
      } else if (package_xml.Package.types.name === "CustomLabel") {
        package_xml.Package.types.members = this.output;
      }
      fs.outputFileSync(manifest, xmlUtil_1.default.jSONToXML(package_xml));
    });
  }
}
exports.default = Buildmanifest;
Buildmanifest.description = messages.getMessage("commandDescription");
Buildmanifest.examples = [
  `$ sfdx sfpowerkit:source:customlabel:buildmanifest -p project1/path/to/customlabelfile.xml -x mdapiout/package.xml\n` +
    `$ sfdx sfpowerkit:source:customlabel:buildmanifest -p project1/path/to/customlabelfile.xml,project2/path/to/customlabelfile.xml -x mdapiout/package.xml`,
];
Buildmanifest.flagsConfig = {
  path: command_1.flags.array({
    required: true,
    char: "p",
    description: messages.getMessage("pathFlagDescription"),
  }),
  manifest: command_1.flags.string({
    required: true,
    char: "x",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRtYW5pZmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3NvdXJjZS9jdXN0b21sYWJlbC9idWlsZG1hbmlmZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUUvRCw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLHVEQUFvRDtBQUNwRCx3RUFBZ0Q7QUFDaEQsZ0ZBQXdEO0FBRXhELHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWixrQ0FBa0MsQ0FDbkMsQ0FBQztBQUVGLE1BQXFCLGFBQWMsU0FBUSxxQkFBVztJQTRDdkMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUkscUJBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV2RCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7Z0JBQ3pDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUN6QjtpQkFBTTtnQkFDTCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7WUFFRCxJQUFJ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
