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
const userPermissionBuilder_1 = __importDefault(
  require("../builder/userPermissionBuilder")
);
const baseMetadataRetriever_1 = __importDefault(
  require("./baseMetadataRetriever")
);
const entityDefinitionRetriever_1 = __importDefault(
  require("./entityDefinitionRetriever")
);
const _ = __importStar(require("lodash"));
const unsuportedObjects = ["PersonAccount"];
/**
 *
 * Used to track Unsupported Userpermission per Licence
 * Update this list when Salesforce change supported permission per licence
 */
const userLicenceMap = [
  {
    name: "Guest User License",
    unsupportedPermissions: ["PasswordNeverExpires"],
  },
];
const QUERY = "SELECT Id, Name, UserType, Description From Profile";
class ProfileRetriever extends baseMetadataRetriever_1.default {
  constructor(org, debugFlag) {
    super(org);
    this.org = org;
    this.debugFlag = debugFlag;
    this.supportedPermissions = [];
    super.setQuery(QUERY);
    if (this.org !== undefined) {
      this.conn = this.org.getConnection();
    }
  }
  loadSupportedPermissions() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.supportedPermissions.length === 0) {
        this.supportedPermissions = yield userPermissionBuilder_1.default.getSupportedPermissions(
          this.conn
        );
      }
    });
  }
  loadProfiles(profileNames, conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var toReturn = null;
      var metadata = yield conn.metadata.readSync("Profile", profileNames);
      if (Array.isArray(metadata)) {
        for (let i = 0; i < metadata.length; i++) {
          yield this.handlePermissions(metadata[i]);
          metadata[i] = yield this.completeObjects(metadata[i], false);
        }
        toReturn = Promise.resolve(metadata);
      } else if (metadata !== null) {
        yield this.handlePermissions(metadata);
        metadata = yield this.completeObjects(metadata, false);
        toReturn = Promise.resolve([metadata]);
      } else {
        toReturn = Promise.resolve([]);
      }
      return toReturn;
    });
  }
  handlePermissions(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      this.handleViewAllDataPermission(profileObj);
      this.handleInstallPackagingPermission(profileObj);
      this.handleQueryAllFilesPermission(profileObj);
      //Check if the permission QueryAllFiles is true and give read access to objects
      profileObj = yield this.completeUserPermissions(profileObj);
      return profileObj;
    });
  }
  completeUserPermissions(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.loadSupportedPermissions();
      // remove unsupported userLicence
      var unsupportedLicencePermissions = this.getUnsupportedLicencePermissions(
        profileObj.userLicense
      );
      if (
        profileObj.userPermissions != null &&
        profileObj.userPermissions.length > 0
      ) {
        profileObj.userPermissions = profileObj.userPermissions.filter(
          (permission) => {
            var supported = !unsupportedLicencePermissions.includes(
              permission.name
            );
            return supported;
          }
        );
      }
      let notRetrievedPermissions = this.supportedPermissions.filter(
        (permission) => {
          let found = null;
          if (
            profileObj.userPermissions != null &&
            profileObj.userPermissions.length > 0
          ) {
            found = profileObj.userPermissions.find((element) => {
              return element.name === permission;
            });
          }
          return found === null || found === undefined;
        }
      );
      var isCustom = "" + profileObj.custom;
      //SfPowerKit.ux.log("Is Custom: " + isCustom);
      if (isCustom == "false") {
        //Remove System permission for standard profile as Salesforce does not support edition on those profile
        delete profileObj.userPermissions;
      } else {
        for (var i = 0; i < notRetrievedPermissions.length; i++) {
          var newPermission = {
            enabled: false,
            name: notRetrievedPermissions[i],
          };
          if (profileObj.userPermissions === undefined) {
            profileObj.userPermissions = new Array();
          }
          if (!Array.isArray(profileObj.userPermissions)) {
            profileObj.userPermissions = [profileObj.userPermissions];
          }
          profileObj.userPermissions.push(newPermission);
        }
      }
      if (profileObj.userPermissions !== undefined) {
        profileObj.userPermissions.sort((perm1, perm2) => {
          let order = 0;
          if (perm1.name < perm2.name) {
            order = -1;
          } else if (perm1.name > perm2.name) {
            order = 1;
          }
          return order;
        });
      }
      return profileObj;
    });
  }
  hasPermission(profileObj, permissionName) {
    let found = false;
    if (
      profileObj.userPermissions !== null &&
      profileObj.userPermissions !== undefined &&
      profileObj.userPermissions.length > 0
    ) {
      for (var i = 0; i < profileObj.userPermissions.length; i++) {
        let element = profileObj.userPermissions[i];
        if (element.name === permissionName) {
          found = element.enabled;
          break;
        }
      }
    }
    return found;
  }
  completeObjects(profileObj, access = true) {
    return __awaiter(this, void 0, void 0, function* () {
      let objPerm = ProfileRetriever.filterObjects(profileObj);
      if (objPerm === undefined) {
        objPerm = new Array();
      } else if (!Array.isArray(objPerm)) {
        objPerm = [objPerm];
      }
      let utils = entityDefinitionRetriever_1.default.getInstance(this.org);
      let objects = yield utils.getObjectForPermission();
      objects.forEach((name) => {
        if (unsuportedObjects.includes(name)) {
          return;
        }
        let objectIsPresent = false;
        for (let i = 0; i < objPerm.length; i++) {
          if (objPerm[i].object === name) {
            objectIsPresent = true;
            break;
          } else {
            objectIsPresent = false;
          }
        }
        if (objectIsPresent === false) {
          //SfPowerKit.ux.log("\n Inserting this object");
          let objToInsert = ProfileRetriever.buildObjPermArray(name, access);
          //SfPowerKit.ux.log(objToInsert);
          if (profileObj.objectPermissions === undefined) {
            profileObj.objectPermissions = new Array();
          } else if (!Array.isArray(profileObj.objectPermissions)) {
            profileObj.objectPermissions = [profileObj.objectPermissions];
          }
          profileObj.objectPermissions.push(objToInsert);
        }
      });
      if (profileObj.objectPermissions !== undefined) {
        profileObj.objectPermissions.sort((obj1, obj2) => {
          let order = 0;
          if (obj1.object < obj2.object) {
            order = -1;
          } else if (obj1.object > obj2.object) {
            order = 1;
          }
          return order;
        });
      }
      return profileObj;
    });
  }
  static buildObjPermArray(objectName, access = true) {
    var newObjPerm = {
      allowCreate: access,
      allowDelete: access,
      allowEdit: access,
      allowRead: access,
      modifyAllRecords: access,
      object: objectName,
      viewAllRecords: access,
    };
    return newObjPerm;
  }
  static filterObjects(profileObj) {
    return profileObj.objectPermissions;
  }
  togglePermission(profileObj, permissionName) {
    if (
      profileObj.userPermissions !== null &&
      profileObj.userPermissions.length > 0
    ) {
      for (var i = 0; i < profileObj.userPermissions.length; i++) {
        let element = profileObj.userPermissions[i];
        if (element.name === permissionName) {
          element.enabled = !element.enabled;
          break;
        }
      }
    }
  }
  enablePermission(profileObj, permissionName) {
    let found = false;
    if (
      profileObj.userPermissions !== null &&
      profileObj.userPermissions.length > 0
    ) {
      for (var i = 0; i < profileObj.userPermissions.length; i++) {
        let element = profileObj.userPermissions[i];
        if (element.name === permissionName) {
          element.enabled = true;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      if (
        profileObj.userPermissions === null ||
        profileObj.userPermissions === undefined
      ) {
        profileObj.userPermissions = [];
      }
      if (this.supportedPermissions.includes(permissionName)) {
        let permission = {
          name: permissionName,
          enabled: true,
        };
        profileObj.userPermissions.push(permission);
      }
    }
  }
  handleQueryAllFilesPermission(profileObj) {
    let isQueryAllFilesPermission = this.hasPermission(
      profileObj,
      "QueryAllFiles"
    );
    if (
      isQueryAllFilesPermission &&
      profileObj.objectPermissions !== undefined &&
      profileObj.objectPermissions.length > 0
    ) {
      for (var i = 0; i < profileObj.objectPermissions.length; i++) {
        profileObj.objectPermissions[i].allowRead = true;
        profileObj.objectPermissions[i].viewAllRecords = true;
      }
    }
  }
  handleViewAllDataPermission(profileObj) {
    let isViewAllData = this.hasPermission(profileObj, "ViewAllData");
    if (
      isViewAllData &&
      profileObj.objectPermissions !== undefined &&
      profileObj.objectPermissions.length > 0
    ) {
      for (var i = 0; i < profileObj.objectPermissions.length; i++) {
        profileObj.objectPermissions[i].allowRead = true;
        profileObj.objectPermissions[i].viewAllRecords = true;
      }
    }
    if (isViewAllData) {
      this.enablePermission(profileObj, "ViewPlatformEvents");
      this.enablePermission(profileObj, "ViewDataLeakageEvents");
    }
  }
  handleInstallPackagingPermission(profileObj) {
    let hasPermission = this.hasPermission(profileObj, "InstallPackaging");
    if (hasPermission) {
      this.enablePermission(profileObj, "ViewDataLeakageEvents");
    }
  }
  getUnsupportedLicencePermissions(licence) {
    if (!_.isNil(licence)) {
      for (var i = 0; i < userLicenceMap.length; i++) {
        if (
          userLicenceMap[i].name.trim().toLocaleLowerCase() ===
          licence.trim().toLocaleLowerCase()
        ) {
          return userLicenceMap[i].unsupportedPermissions;
        }
      }
    }
    return [];
  }
  /**
   * Return All profile object from the connected Org
   */
  getProfiles() {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      _super.setQuery.call(this, QUERY);
      return yield _super.getObjects.call(this);
    });
  }
  /**
   * Get a profile by Profile Name
   * @param name The name of the profile to return
   */
  getProfileByName(name) {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      _super.setQuery.call(this, QUERY + " WHERE Name='" + name + "'");
      let profiles = yield _super.getObjects.call(this);
      if (profiles.length > 0) {
        return profiles[0];
      }
      return undefined;
    });
  }
}
exports.default = ProfileRetriever;
ProfileRetriever.supportedMetadataTypes = [
  "ApexClass",
  "CustomApplication",
  "CustomObject",
  "CustomField",
  "Layout",
  "ApexPage",
  "CustomTab",
  "RecordType",
  "SystemPermissions",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZVJldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci9wcm9maWxlUmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLDZGQUFxRTtBQUtyRSxvRkFBNEQ7QUFDNUQsNEZBQW9FO0FBQ3BFLDBDQUE0QjtBQUU1QixNQUFNLGlCQUFpQixHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDNUM7Ozs7R0FJRztBQUNILE1BQU0sY0FBYyxHQUFHO0lBQ3JCO1FBQ0UsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixzQkFBc0IsRUFBRSxDQUFDLHNCQUFzQixDQUFDO0tBQ2pEO0NBQ0YsQ0FBQztBQUVGLE1BQU0sS0FBSyxHQUFHLHFEQUFxRCxDQUFDO0FBQ3BFLE1BQXFCLGdCQUFpQixTQUFRLCtCQUU3QztJQWtCQyxZQUEwQixHQUFRLEVBQVUsU0FBbUI7UUFDN0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRGEsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFML0QseUJBQW9CLEdBQWEsRUFBRSxDQUFDO1FBT2xDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEM7SUFDSCxDQUFDO0lBRVksd0JBQXdCOztZQUNuQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsTUFBTSwrQkFBcUIsQ0FBQyx1QkFBdUIsQ0FDN0UsSUFBSSxDQUFDLElBQUksQ0FDVixD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
