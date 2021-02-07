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
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
const _ = require("lodash");
const parser = new xml2js.Parser({
  explicitArray: false,
  valueProcessors: [
    function (name) {
      if (name === "true") name = true;
      if (name === "false") name = false;
      return name;
    },
  ],
});
class CustomLabelsDiff {
  static getMembers(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let fileContent = fs.readFileSync(filePath, "utf8").toString();
      const parseString = util.promisify(parser.parseString);
      let members = [];
      if (fileContent !== "") {
        let parseResult = yield parseString(fileContent);
        let customLabelsObj = parseResult.CustomLabels || {};
        if (!_.isNil(customLabelsObj.labels)) {
          if (!Array.isArray(customLabelsObj.labels)) {
            members.push(customLabelsObj.labels.fullName);
          } else {
            members = customLabelsObj.labels.map((label) => {
              return label.fullName;
            });
          }
        }
      }
      return members;
    });
  }
  static generateCustomLabelsXml(
    customLabelsXml1,
    customLabelsXml2,
    outputFilePath,
    destructivePackageObj,
    resultOutput,
    isDestructive
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      let customLabelsObj1 = {};
      let customLabelsObj2 = {};
      const parseString = util.promisify(parser.parseString);
      if (customLabelsXml1 !== "") {
        let parseResult = yield parseString(customLabelsXml1);
        customLabelsObj1 = parseResult.CustomLabels || {};
      }
      if (customLabelsXml2 !== "") {
        let parseResult = yield parseString(customLabelsXml2);
        customLabelsObj2 = parseResult.CustomLabels || {};
      }
      // Building the new workflow object for the added and modified fields
      let addedEditedOrDeleted = CustomLabelsDiff.buildCustomLabelsObj(
        customLabelsObj1,
        customLabelsObj2
      );
      if (
        addedEditedOrDeleted.addedEdited.labels &&
        addedEditedOrDeleted.addedEdited.labels.length > 0
      ) {
        CustomLabelsDiff.writeCustomLabel(
          addedEditedOrDeleted.addedEdited,
          outputFilePath
        );
      }
      // Check for deletion
      destructivePackageObj = CustomLabelsDiff.buildDestructiveChanges(
        addedEditedOrDeleted.deleted,
        destructivePackageObj
      );
      CustomLabelsDiff.updateOutput(
        addedEditedOrDeleted.addedEdited,
        resultOutput,
        "Deploy",
        outputFilePath
      );
      if (isDestructive) {
        CustomLabelsDiff.updateOutput(
          addedEditedOrDeleted.deleted,
          resultOutput,
          "Delete",
          "destructiveChanges.xml"
        );
      }
      return destructivePackageObj;
    });
  }
  static updateOutput(customLabelObj, resultOutput, action, filePath) {
    customLabelObj.labels.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "CustomLabel",
        componentName: elem.fullName,
        path: filePath,
      });
    });
  }
  static buildCustomLabelsObj(customLabelsObj1, customLabelsObj2) {
    let newcustomLabelsObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      labels: [],
    };
    if (
      !_.isNil(customLabelsObj1.labels) &&
      !Array.isArray(customLabelsObj1.labels)
    ) {
      customLabelsObj1.labels = [customLabelsObj1.labels];
    }
    if (
      !_.isNil(customLabelsObj2.labels) &&
      !Array.isArray(customLabelsObj2.labels)
    ) {
      customLabelsObj2.labels = [customLabelsObj2.labels];
    }
    let deletedCustomLabelsObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      labels: [],
    };
    let addedDeleted = diffUtil_1.default.getChangedOrAdded(
      customLabelsObj1.labels,
      customLabelsObj2.labels,
      "fullName"
    );
    newcustomLabelsObj.labels = addedDeleted.addedEdited;
    deletedCustomLabelsObj.labels = addedDeleted.deleted;
    return {
      addedEdited: newcustomLabelsObj,
      deleted: deletedCustomLabelsObj,
    };
  }
  static buildDestructiveChanges(deletedCustomLabels, destructivePackageObj) {
    let labelType = _.find(destructivePackageObj, function (metaType) {
      return metaType.name === "CustomLabel";
    });
    if (
      labelType === undefined &&
      deletedCustomLabels.labels !== undefined &&
      deletedCustomLabels.labels.length > 0
    ) {
      labelType = {
        name: "CustomLabel",
        members: [],
      };
      destructivePackageObj.push(labelType);
    }
    if (deletedCustomLabels.labels !== undefined) {
      deletedCustomLabels.labels.forEach((elem) => {
        labelType.members.push(elem.fullName);
      });
    }
    return destructivePackageObj;
  }
  static writeCustomLabel(newCustomLabelsObj, outputFilePath) {
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8", standalone: null },
    });
    let customLabelObj = {
      CustomLabels: newCustomLabelsObj,
    };
    let xml = builder.buildObject(customLabelObj);
    fs.writeFileSync(outputFilePath, xml);
  }
}
exports.default = CustomLabelsDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tTGFiZWxzRGlmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL3Byb2plY3QvZGlmZi9jdXN0b21MYWJlbHNEaWZmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrQ0FBaUM7QUFDakMsMkNBQTZCO0FBQzdCLDBEQUFrQztBQUNsQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQy9CLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLGVBQWUsRUFBRTtRQUNmLFVBQVMsSUFBSTtZQUNYLElBQUksSUFBSSxLQUFLLE1BQU07Z0JBQUUsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQyxJQUFJLElBQUksS0FBSyxPQUFPO2dCQUFFLElBQUksR0FBRyxLQUFLLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFxQixnQkFBZ0I7SUFDNUIsTUFBTSxDQUFPLFVBQVUsQ0FBQyxRQUFnQjs7WUFDN0MsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDL0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkQsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksV0FBVyxLQUFLLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELElBQUksZUFBZSxHQUFHLFdBQVcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO2dCQUNy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
