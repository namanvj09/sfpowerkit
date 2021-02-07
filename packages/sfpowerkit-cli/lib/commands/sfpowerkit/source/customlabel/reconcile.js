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
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs-extra"));
const rimraf = __importStar(require("rimraf"));
const path = __importStar(require("path"));
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "source_customlabel_clean"
);
class Reconcile extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      // Gives first value in url after https protocol
      const packageName = this.flags.project;
      this.customlabel_path = this.flags.path;
      if (
        fs.existsSync(path.resolve(this.customlabel_path)) &&
        path.extname(this.customlabel_path) == ".xml"
      ) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        let retrieved_customlabels = yield parseString(
          fs.readFileSync(path.resolve(this.customlabel_path))
        );
        if (!Object.keys(retrieved_customlabels).includes("CustomLabels")) {
          this.ux.log(`Metadata Mismatch: Not A CustomLabels Metadata File`);
          rimraf.sync("temp_sfpowerkit");
          return 1;
        }
        console.log(`Package ::: ${packageName}`);
        if (this.isIterable(retrieved_customlabels.CustomLabels.labels)) {
          retrieved_customlabels.CustomLabels.labels = retrieved_customlabels.CustomLabels.labels.filter(
            (item) => item.fullName.startsWith(`${packageName}_`)
          );
        } else {
          if (
            !retrieved_customlabels.CustomLabels.labels.fullName.startsWith(
              "${packageName}_`"
            )
          )
            delete retrieved_customlabels.CustomLabels.labels;
        }
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(retrieved_customlabels);
        yield fs.writeFileSync(path.resolve(this.customlabel_path), xml);
        this.ux.log(
          `Reconciled The Custom Labels  only to have ${packageName} labels (labels with full name beginning with ${packageName}_)`
        );
      } else {
        this.ux.log(`File is either not found, or not an xml file.`);
      }
      rimraf.sync("temp_sfpowerkit");
      return 0;
    });
  }
  isIterable(obj) {
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === "function";
  }
}
exports.default = Reconcile;
Reconcile.description = messages.getMessage("commandDescription");
Reconcile.examples = [
  `$ sfdx sfpowerkit:source:customlabel:reconcile -d path/to/customlabelfile.xml -p core
    Cleaned The Custom Labels
`,
];
Reconcile.flagsConfig = {
  path: command_1.flags.string({
    required: true,
    char: "d",
    description: messages.getMessage("pathFlagDescription"),
  }),
  project: command_1.flags.string({
    required: true,
    char: "p",
    description: messages.getMessage("packageFlagDescription"),
  }),
};
// Comment this out if your command does not require an org username
//protected static requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Reconcile.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvc291cmNlL2N1c3RvbWxhYmVsL3JlY29uY2lsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBK0Q7QUFFL0QsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUM3Qiw2Q0FBK0I7QUFDL0IsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUU3Qix3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osMEJBQTBCLENBQzNCLENBQUM7QUFFRixNQUFxQixTQUFVLFNBQVEscUJBQVc7SUFpQ25DLEdBQUc7O1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRS9CLGdEQUFnRDtZQUNoRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFeEMsSUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksTUFBTSxFQUM3QztnQkFDQSxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNB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
