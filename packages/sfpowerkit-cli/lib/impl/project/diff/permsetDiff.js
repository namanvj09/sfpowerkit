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
const _ = __importStar(require("lodash"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
const nonArayProperties = [
  "description",
  "hasActivationRequired",
  "label",
  "license",
  "userLicense",
  "$",
  "fullName",
];
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
class PermsetDiff {
  constructor(debugFlag) {
    this.debugFlag = debugFlag;
  }
  static generatePermissionsetXml(
    permissionsetXml1,
    permissionsetXml2,
    outputFilePath
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      const parseString = util.promisify(parser.parseString);
      let parseResult = yield parseString(permissionsetXml1);
      let permsetObj1 = parseResult.PermissionSet;
      parseResult = yield parseString(permissionsetXml2);
      let permsetObj2 = parseResult.PermissionSet;
      let newPermsetObj = {};
      newPermsetObj.label = permsetObj2.label;
      if (!_.isNil(permsetObj2.description)) {
        newPermsetObj.description = permsetObj2.description;
      }
      if (!_.isNil(permsetObj2.license)) {
        newPermsetObj.license = permsetObj2.license;
      }
      if (permsetObj2.hasActivationRequired) {
        newPermsetObj.hasActivationRequired = permsetObj2.hasActivationRequired;
      }
      newPermsetObj.applicationVisibilities = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.applicationVisibilities,
        permsetObj2.applicationVisibilities,
        "application"
      ).addedEdited;
      newPermsetObj.classAccesses = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.classAccesses,
        permsetObj2.classAccesses,
        "apexClass"
      ).addedEdited;
      newPermsetObj.customPermissions = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.customPermissions,
        permsetObj2.customPermissions,
        "name"
      ).addedEdited;
      newPermsetObj.externalDataSourceAccesses = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.externalDataSourceAccesses,
        permsetObj2.externalDataSourceAccesses,
        "externalDataSource"
      ).addedEdited;
      newPermsetObj.fieldPermissions = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.fieldPermissions,
        permsetObj2.fieldPermissions,
        "field"
      ).addedEdited;
      newPermsetObj.objectPermissions = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.objectPermissions,
        permsetObj2.objectPermissions,
        "object"
      ).addedEdited;
      newPermsetObj.pageAccesses = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.pageAccesses,
        permsetObj2.pageAccesses,
        "apexPage"
      ).addedEdited;
      newPermsetObj.recordTypeVisibilities = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.recordTypeVisibilities,
        permsetObj2.recordTypeVisibilities,
        "recordType"
      ).addedEdited;
      newPermsetObj.tabSettings = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.tabSettings,
        permsetObj2.tabSettings,
        "tab"
      ).addedEdited;
      newPermsetObj.userPermissions = diffUtil_1.default.getChangedOrAdded(
        permsetObj1.userPermissions,
        permsetObj2.userPermissions,
        "name"
      ).addedEdited;
      yield PermsetDiff.writePermset(newPermsetObj, outputFilePath);
    });
  }
  static writePermset(permsetObj, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      //Delete eampty arrays
      for (var key in permsetObj) {
        if (Array.isArray(permsetObj[key])) {
          //All top element must be arays exept non arrayProperties
          if (
            !nonArayProperties.includes(key) &&
            permsetObj[key].length === 0
          ) {
            delete permsetObj[key];
          }
        }
      }
      if (permsetObj.label != undefined) {
        var builder = new xml2js.Builder({ rootName: "PermissionSet" });
        permsetObj["$"] = {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        };
        var xml = builder.buildObject(permsetObj);
        fs.writeFileSync(filePath, xml);
      }
    });
  }
}
exports.default = PermsetDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybXNldERpZmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L2RpZmYvcGVybXNldERpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBRy9CLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsMENBQTRCO0FBQzVCLDBEQUFrQztBQUVsQyxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsT0FBTztJQUNQLFNBQVM7SUFDVCxhQUFhO0lBQ2IsR0FBRztJQUNILFVBQVU7Q0FDWCxDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQy9CLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLGVBQWUsRUFBRTtRQUNmLFVBQVMsSUFBSTtZQUNYLElBQUksSUFBSSxLQUFLLE1BQU07Z0JBQUUsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQyxJQUFJLElBQUksS0FBSyxPQUFPO2dCQUFFLElBQUksR0FBRyxLQUFLLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUE4QixXQUFXO0lBR3ZDLFlBQW1CLFNBQW1CO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFTSxNQUFNLENBQU8sd0JBQXdCLENBQzFDLGlCQUF5QixFQUN6QixpQkFBeUIsRUFDekIsY0FBc0I7O1lBRXRCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXZELElBQUksV0FBVyxHQUFHLE1BQU0sV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkQsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztZQUM1QyxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1lBRTVDLElBQUksYUFBYSxHQUFHLEVBQVMsQ0FBQztZQUU5QixhQUFhLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFeEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNyQyxhQUFhLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7YUFDckQ7WUFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2pDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQzthQUM3QztZQUNELElBQUksV0FBVyxDQUFDLHFCQUFxQixFQUFFO2dCQUNyQyxhQUFhLENBQUMscUJBQXFCLEdBQUcsV0FBVyxDQUFDLHFCQUFxQixDQUFDO2FBQ3pFO1lBRUQsYUFBYSxDQUFDLHVCQUF1QixHQUFHLGtCQUFRLENBQUMsaUJBQWlCLENBQ2hFLFdBQVcsQ0FBQyx1QkFBdUIsRUFDbkMsV0FBVyxDQUFDLHVCQUF1QixFQUNuQyxhQUFhLENBQ2QsQ0FBQyxXQUFXLENBQUM7WUFDZCxhQUFhLENBQUMsYUFBYSxHQUFHLGtCQUFRLENBQUMsaUJBQWlCLENBQ3RELFdBQVcsQ0FBQyxhQUFhLEVBQ3pCLFdBQVcsQ0FBQyxhQUFhLEVBQ3pCLFdBQVcsQ0FDWixDQUFDLFdBQVcsQ0FBQztZQUNkLGFBQWEsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBUSxDQUFDLGlCQUFpQixDQUMxRCxXQUFXLENBQUMsaUJBQWlCLEVBQzdCLFdBQVcsQ0FBQyxpQkFBaUIsRUFDN0IsTUFBTSxDQUNQLENBQUMsV0FBVyxDQUFDO1lBQ2QsYUFBYSxDQUFDLDBCQUEwQixHQUFHLGtCQUFRLENBQUMsaUJBQWlCLENBQ25FLFdBQVcsQ0FBQywwQkFBMEIsRUFDdEMsV0FBVyxDQUFDLDBCQUEwQixFQUN0QyxvQkFBb0IsQ0FDckIsQ0FBQyxXQUFXLENBQUM7WUFFZCxhQUFhLENBQUMsZ0JBQWdCLEdBQUcsa0JBQVEsQ0FBQyxpQkFBaUIsQ0FDekQsV0FBVyxDQUFDLGdCQUFnQixFQUM1QixXQUFXLENBQUMsZ0JBQWdCLEVBQzVCLE9BQU8sQ0FDUixDQUFDLFdBQVcsQ0FBQztZQUVkLGFBQWEsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBUSxDQUFDLGlCQUFpQixDQUMxRCxXQUFXLENBQUMsaUJBQWlCLEVBQzdCLFdBQVcsQ0FBQyxpQkFBaUIsRUFDN0IsUUFBUSxDQUNULENBQUMsV0FBVyxDQUFDO1lBQ2QsYUFBYSxDQUFDLFlBQVksR0FBRyxrQkFBUSxDQUFDLGlCQUFpQixDQUNyRCxXQUFXLENBQUMsWUFBWSxFQUN4QixXQUFXLENBQUMsWUFBWSxFQUN4QixVQUFVLENBQ1gsQ0FBQyxXQUFXLENBQUM7WUFFZCxhQUFhLENBQUMsc0JBQXNCLEdBQUcsa0JBQVEsQ0FBQyxpQkFBaUIsQ0FDL0QsV0FBVyxDQUFDLHNCQUFzQixFQUNsQyxXQUFXLENBQUMsc0JBQXNCLEVBQ2xDLFlBQVksQ0FDYixDQUFDLFdBQVcsQ0FBQztZQUNkLGFBQWEsQ0FBQyxXQUFXLEdBQUcsa0JBQVEsQ0FBQyxpQkFBaUIsQ0FDcEQsV0FBVyxDQUFDLFdBQVcsRUFDdkIsV0FBVyxDQUFDLFdBQVcsRUFDdkIsS0FBSyxDQUNOLENBQUMsV0FBVyxDQUFDO1lBQ2QsYUFBYSxDQUFDLGVBQWUsR0FBRyxrQkFBUSxDQUFDLGlCQUFpQixDQUN4RCxXQUFXLENBQUMsZUFBZSxFQUMzQixXQUFXLENBQUMsZUFBZSxFQUMzQixNQUFNLENBQ1AsQ0FBQyxXQUFXLENBQUM7WUFFZCxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBTyxZQUFZLENBQUMsVUFBZSxFQUFFLFFBQWdCOztZQUNqRSxzQkFBc0I7WUFDdEIsS0FBSyxJQUFJLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQzFCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDbEMseURBQXlEO29CQUN6RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUNwRSxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDeEI7aUJBQ0Y7YUFDRjtZQUNELElBQUksVUFBVSxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLElBQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUc7b0JBQ2hCLEtBQUssRUFBRSx5Q0FBeUM7aUJBQ2pELENBQUM7Z0JBQ0YsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFMUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDakM7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQTlHRCw4QkE4R0MifQ==
