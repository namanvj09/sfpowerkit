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
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const _ = __importStar(require("lodash"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
const profileWriter_1 = __importDefault(
  require("../../../impl/metadata/writer/profileWriter")
);
class ProfileDiff {
  static generateProfileXml(profileXml1, profileXml2, outputFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let profileWriter = new profileWriter_1.default();
      const parser = new xml2js.Parser({ explicitArray: true });
      const parseString = util.promisify(parser.parseString);
      let parseResult = yield parseString(profileXml1);
      let profileObj1 = profileWriter.toProfile(parseResult.Profile);
      parseResult = yield parseString(profileXml2);
      let profileObj2 = profileWriter.toProfile(parseResult.Profile);
      let newProObj = {
        fullName: profileObj2.fullName,
        applicationVisibilities: [],
        classAccesses: [],
        customMetadataTypeAccesses: [],
        customPermissions: [],
        customSettingAccesses: [],
        externalDataSourceAccesses: [],
        fieldLevelSecurities: [],
        fieldPermissions: [],
        flowAccesses: [],
        layoutAssignments: [],
        loginHours: [],
        loginIpRanges: [],
        objectPermissions: [],
        pageAccesses: [],
        profileActionOverrides: [],
        recordTypeVisibilities: [],
        tabVisibilities: [],
        userPermissions: [],
      };
      if (!_.isNil(profileObj2.description)) {
        newProObj.description = profileObj2.description;
      }
      newProObj.applicationVisibilities = diffUtil_1.default.getChangedOrAdded(
        profileObj1.applicationVisibilities,
        profileObj2.applicationVisibilities,
        "application"
      ).addedEdited;
      newProObj.classAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.classAccesses,
        profileObj2.classAccesses,
        "apexClass"
      ).addedEdited;
      newProObj.customPermissions = diffUtil_1.default.getChangedOrAdded(
        profileObj1.customPermissions,
        profileObj2.customPermissions,
        "name"
      ).addedEdited;
      newProObj.externalDataSourceAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.externalDataSourceAccesses,
        profileObj2.externalDataSourceAccesses,
        "externalDataSource"
      ).addedEdited;
      newProObj.fieldLevelSecurities = diffUtil_1.default.getChangedOrAdded(
        profileObj1.fieldLevelSecurities,
        profileObj2.fieldLevelSecurities,
        "field"
      ).addedEdited;
      newProObj.fieldPermissions = diffUtil_1.default.getChangedOrAdded(
        profileObj1.fieldPermissions,
        profileObj2.fieldPermissions,
        "field"
      ).addedEdited;
      newProObj.loginHours = !_.isEqual(
        profileObj1.loginHours,
        profileObj2.loginHours
      )
        ? profileObj2.loginHours
        : [];
      newProObj.loginIpRanges = !_.isEqual(
        profileObj1.loginIpRanges,
        profileObj2.loginIpRanges
      )
        ? profileObj2.loginIpRanges
        : [];
      newProObj.objectPermissions = diffUtil_1.default.getChangedOrAdded(
        profileObj1.objectPermissions,
        profileObj2.objectPermissions,
        "object"
      ).addedEdited;
      newProObj.pageAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.pageAccesses,
        profileObj2.pageAccesses,
        "apexPage"
      ).addedEdited;
      newProObj.profileActionOverrides = diffUtil_1.default.getChangedOrAdded(
        profileObj1.profileActionOverrides,
        profileObj2.profileActionOverrides,
        "actionName"
      ).addedEdited;
      newProObj.recordTypeVisibilities = diffUtil_1.default.getChangedOrAdded(
        profileObj1.recordTypeVisibilities,
        profileObj2.recordTypeVisibilities,
        "recordType"
      ).addedEdited;
      newProObj.tabVisibilities = diffUtil_1.default.getChangedOrAdded(
        profileObj1.tabVisibilities,
        profileObj2.tabVisibilities,
        "tab"
      ).addedEdited;
      newProObj.userPermissions = diffUtil_1.default.getChangedOrAdded(
        profileObj1.userPermissions,
        profileObj2.userPermissions,
        "name"
      ).addedEdited;
      newProObj.layoutAssignments = this.getChangedOrAddedLayouts(
        profileObj1.layoutAssignments,
        profileObj2.layoutAssignments
      );
      newProObj.customMetadataTypeAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.customMetadataTypeAccesses,
        profileObj2.customMetadataTypeAccesses,
        "name"
      ).addedEdited;
      newProObj.customSettingAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.customSettingAccesses,
        profileObj2.customSettingAccesses,
        "name"
      ).addedEdited;
      newProObj.flowAccesses = diffUtil_1.default.getChangedOrAdded(
        profileObj1.flowAccesses,
        profileObj2.flowAccesses,
        "flow"
      ).addedEdited;
      if (newProObj.fullName === undefined || newProObj.fullName === "") {
        delete newProObj.fullName;
      }
      profileWriter.writeProfile(newProObj, outputFilePath);
    });
  }
  static getChangedOrAddedLayouts(list1, list2) {
    let result = [];
    if (_.isNil(list1) && !_.isNil(list2) && list2.length > 0) {
      result.push(...list2);
    }
    if (!_.isNil(list1) && !_.isNil(list2)) {
      list2.forEach((layoutAss2) => {
        let found = false;
        for (let i = 0; i < list1.length; i++) {
          let layoutAss1 = list1[i];
          if (layoutAss1.layout === layoutAss2.layout) {
            //check if edited
            if (_.isEqual(layoutAss1, layoutAss2)) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          result.push(layoutAss2);
        }
      });
    }
    return result;
  }
}
exports.default = ProfileDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZURpZmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L2RpZmYvcHJvZmlsZURpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUU3QiwwQ0FBNEI7QUFFNUIsMERBQWtDO0FBQ2xDLGdHQUF3RTtBQUV4RSxNQUE4QixXQUFXO0lBQ2hDLE1BQU0sQ0FBTyxrQkFBa0IsQ0FDcEMsV0FBbUIsRUFDbkIsV0FBbUIsRUFDbkIsY0FBc0I7O1lBRXRCLElBQUksYUFBYSxHQUFHLElBQUksdUJBQWEsRUFBRSxDQUFDO1lBRXhDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzFELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXZELElBQUksV0FBVyxHQUFHLE1BQU0sV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pELElBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QyxJQUFJLFdBQVcsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvRCxJQUFJLFNBQVMsR0FBRztnQkFDZCxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7Z0JBQzlCLHVCQUF1QixFQUFFLEVBQUU7Z0JBQzNCLGFBQWEsRUFBRSxFQUFFO2dCQUNqQiwwQkFBMEIsRUFBRSxFQUFFO2dCQUM5QixpQkFBaUIsRUFBRSxFQUFFO2dCQUNyQixxQkFBcUIsRUFBRSxFQUFF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
