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
const _ = require("lodash");
const util = __importStar(require("util"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
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
class SharingRuleDiff {
  static generateSharingRulesXml(
    sharingRuleXml1,
    sharingRuleXml2,
    outputFilePath,
    objectName,
    destructivePackageObj,
    resultOutput,
    isDestructive
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      const parseString = util.promisify(parser.parseString);
      let sharingRulesObj1 = {};
      let sharingRulesObj2 = {};
      if (sharingRuleXml1 !== "") {
        let parseResult = yield parseString(sharingRuleXml1);
        sharingRulesObj1 = parseResult.SharingRules || {};
      }
      if (sharingRuleXml2 !== "") {
        let parseResult = yield parseString(sharingRuleXml2);
        sharingRulesObj2 = parseResult.SharingRules || {};
      }
      let addedEditedOrDeleted = SharingRuleDiff.buildSharingRulesObj(
        sharingRulesObj1,
        sharingRulesObj2
      );
      SharingRuleDiff.writeSharingRule(
        addedEditedOrDeleted.addedEdited,
        outputFilePath
      );
      destructivePackageObj = SharingRuleDiff.buildDestructiveChangesObj(
        addedEditedOrDeleted.deleted,
        destructivePackageObj,
        objectName
      );
      SharingRuleDiff.updateOutput(
        addedEditedOrDeleted.addedEdited,
        resultOutput,
        objectName,
        "Deploy",
        outputFilePath
      );
      if (isDestructive) {
        SharingRuleDiff.updateOutput(
          addedEditedOrDeleted.deleted,
          resultOutput,
          objectName,
          "Delete",
          "destructiveChanges.xml"
        );
      }
      return destructivePackageObj;
    });
  }
  static updateOutput(
    sharingRulesObj,
    resultOutput,
    objectName,
    action,
    filePath
  ) {
    sharingRulesObj.sharingCriteriaRules.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "SharingCriteriaRule",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    sharingRulesObj.sharingOwnerRules.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "SharingOwnerRule",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    sharingRulesObj.sharingTerritoryRules.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "SharingTerritoryRule",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
  }
  static ensureArray(sharingObj) {
    let keys = Object.keys(sharingObj);
    keys.forEach((key) => {
      if (
        typeof sharingObj[key] === "object" &&
        !Array.isArray(sharingObj[key]) &&
        key !== "$"
      ) {
        sharingObj[key] = [sharingObj[key]];
      }
    });
    return sharingObj;
  }
  static getMembers(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let fileContent = fs.readFileSync(filePath, "utf8").toString();
      const parseString = util.promisify(parser.parseString);
      let members = {};
      if (fileContent !== "") {
        let parseResult = yield parseString(fileContent);
        let sharingRulesObj = parseResult.SharingRules || {};
        if (!_.isNil(sharingRulesObj.sharingCriteriaRules)) {
          if (!Array.isArray(sharingRulesObj.sharingCriteriaRules)) {
            members["SharingCriteriaRule"] = [
              sharingRulesObj.sharingCriteriaRules.fullName,
            ];
          } else {
            members[
              "SharingCriteriaRule"
            ] = sharingRulesObj.sharingCriteriaRules.map((sharingRule) => {
              return sharingRule.fullName;
            });
          }
        }
        if (!_.isNil(sharingRulesObj.sharingOwnerRules)) {
          if (!Array.isArray(sharingRulesObj.sharingOwnerRules)) {
            members["SharingOwnerRule"] = [
              sharingRulesObj.sharingOwnerRules.fullName,
            ];
          } else {
            members["SharingOwnerRule"] = sharingRulesObj.sharingOwnerRules.map(
              (sharingRule) => {
                return sharingRule.fullName;
              }
            );
          }
        }
        if (!_.isNil(sharingRulesObj.sharingTerritoryRules)) {
          if (!Array.isArray(sharingRulesObj.sharingTerritoryRules)) {
            members["SharingTerritoryRule"] = [
              sharingRulesObj.sharingTerritoryRules.fullName,
            ];
          } else {
            members[
              "SharingTerritoryRule"
            ] = sharingRulesObj.sharingTerritoryRules.map((sharingRule) => {
              return sharingRule.fullName;
            });
          }
        }
        if (!_.isNil(sharingRulesObj.sharingGuestRules)) {
          if (!Array.isArray(sharingRulesObj.sharingGuestRules)) {
            members["SharingGuestRule"] = [
              sharingRulesObj.sharingGuestRules.fullName,
            ];
          } else {
            members["SharingGuestRule"] = sharingRulesObj.sharingGuestRules.map(
              (sharingRule) => {
                return sharingRule.fullName;
              }
            );
          }
        }
      }
      return members;
    });
  }
  static buildSharingRulesObj(sharingRuleObj1, sharingRulesObj2) {
    let newSharingRuleObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      sharingCriteriaRules: [],
      sharingOwnerRules: [],
      sharingTerritoryRules: [],
      sharingGuestRules: [],
    };
    sharingRuleObj1 = SharingRuleDiff.ensureArray(sharingRuleObj1);
    sharingRulesObj2 = SharingRuleDiff.ensureArray(sharingRulesObj2);
    let deletedSharingObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      sharingCriteriaRules: [],
      sharingOwnerRules: [],
      sharingTerritoryRules: [],
      sharingGuestRules: [],
    };
    let addedDeleted = diffUtil_1.default.getChangedOrAdded(
      sharingRuleObj1.sharingCriteriaRules,
      sharingRulesObj2.sharingCriteriaRules,
      "fullName"
    );
    newSharingRuleObj.sharingCriteriaRules = addedDeleted.addedEdited;
    deletedSharingObj.sharingCriteriaRules = addedDeleted.deleted;
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      sharingRuleObj1.sharingOwnerRules,
      sharingRulesObj2.sharingOwnerRules,
      "fullName"
    );
    newSharingRuleObj.sharingOwnerRules = addedDeleted.addedEdited;
    deletedSharingObj.sharingOwnerRules = addedDeleted.deleted;
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      sharingRuleObj1.sharingTerritoryRules,
      sharingRulesObj2.sharingTerritoryRules,
      "fullName"
    );
    newSharingRuleObj.sharingTerritoryRules = addedDeleted.addedEdited;
    deletedSharingObj.sharingTerritoryRules = addedDeleted.deleted;
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      sharingRuleObj1.sharingGuestRules,
      sharingRulesObj2.sharingGuestRules,
      "fullName"
    );
    newSharingRuleObj.sharingGuestRules = addedDeleted.addedEdited;
    deletedSharingObj.sharingGuestRules = addedDeleted.deleted;
    return {
      addedEdited: newSharingRuleObj,
      deleted: deletedSharingObj,
    };
  }
  static buildDestructiveChangesObj(
    deletedSharing,
    destructivePackageObj,
    objectName
  ) {
    let sharingCriteriaRules = _.find(
      destructivePackageObj,
      function (metaType) {
        return metaType.name === "SharingCriteriaRule";
      }
    );
    if (
      sharingCriteriaRules === undefined &&
      deletedSharing.sharingCriteriaRules !== undefined &&
      deletedSharing.sharingCriteriaRules.length > 0
    ) {
      sharingCriteriaRules = {
        name: "SharingCriteriaRule",
        members: [],
      };
      destructivePackageObj.push(sharingCriteriaRules);
    }
    if (deletedSharing.sharingCriteriaRules !== undefined) {
      deletedSharing.sharingCriteriaRules.forEach((elem) => {
        sharingCriteriaRules.members.push(objectName + "." + elem.fullName);
      });
    }
    let sharingOwnerRules = _.find(destructivePackageObj, function (metaType) {
      return metaType.name === "SharingOwnerRule";
    });
    if (
      sharingOwnerRules === undefined &&
      deletedSharing.sharingOwnerRules !== undefined &&
      deletedSharing.sharingOwnerRules.length > 0
    ) {
      sharingOwnerRules = {
        name: "SharingOwnerRule",
        members: [],
      };
      destructivePackageObj.push(sharingOwnerRules);
    }
    if (deletedSharing.sharingOwnerRules !== undefined) {
      deletedSharing.sharingOwnerRules.forEach((elem) => {
        sharingOwnerRules.members.push(objectName + "." + elem.fullName);
      });
    }
    let sharingTerritoryRules = _.find(
      destructivePackageObj,
      function (metaType) {
        return metaType.name === "SharingTerritoryRule";
      }
    );
    if (
      sharingTerritoryRules === undefined &&
      deletedSharing.sharingTerritoryRules !== undefined &&
      deletedSharing.sharingTerritoryRules.length > 0
    ) {
      sharingTerritoryRules = {
        name: "SharingTerritoryRule",
        members: [],
      };
      destructivePackageObj.push(sharingTerritoryRules);
    }
    if (deletedSharing.sharingTerritoryRules !== undefined) {
      deletedSharing.sharingTerritoryRules.forEach((elem) => {
        sharingTerritoryRules.members.push(objectName + "." + elem.fullName);
      });
    }
    return destructivePackageObj;
  }
  static writeSharingRule(newSharingRulesObj, outputFilePath) {
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8", standalone: null },
    });
    let sharingRulesObj = {
      SharingRules: newSharingRulesObj,
    };
    let xml = builder.buildObject(sharingRulesObj);
    fs.writeFileSync(outputFilePath, xml);
  }
}
exports.default = SharingRuleDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmluZ1J1bGVEaWZmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvcHJvamVjdC9kaWZmL3NoYXJpbmdSdWxlRGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsK0NBQWlDO0FBQ2pDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QiwyQ0FBNkI7QUFDN0IsMERBQWtDO0FBRWxDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMvQixhQUFhLEVBQUUsS0FBSztJQUNwQixlQUFlLEVBQUU7UUFDZixVQUFTLElBQUk7WUFDWCxJQUFJLElBQUksS0FBSyxNQUFNO2dCQUFFLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakMsSUFBSSxJQUFJLEtBQUssT0FBTztnQkFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBcUIsZUFBZTtJQUMzQixNQUFNLENBQU8sdUJBQXVCLENBQ3pDLGVBQXVCLEVBQ3ZCLGVBQXVCLEVBQ3ZCLGNBQXNCLEVBQ3RCLFVBQWtCLEVBQ2xCLHFCQUE0QixFQUM1QixZQUFtQixFQUNuQixhQUFzQjs7WUFFdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkQsSUFBSSxnQkFBZ0IsR0FBUSxFQUFFLENBQUM7WUFDL0IsSUFBSSxnQkFBZ0IsR0FBUSxFQUFFLENBQUM7WUFFL0IsSUFBSSxlQUFlLEtBQUssRUFBRSxFQUFFO2dCQUMxQixJQUFJLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDckQsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLFlB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
