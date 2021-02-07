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
const _ = __importStar(require("lodash"));
const userPermissionDependencies = [
  {
    name: "ViewAllData",
    permissionsRequired: ["ViewPlatformEvents", "ViewDataLeakageEvents"],
    hasAccessOnData: true,
  },
  {
    name: "QueryAllFiles",
    hasAccessOnData: true,
  },
  {
    name: "InstallPackaging",
    permissionsRequired: ["ViewDataLeakageEvents", "EditPublicReports"],
  },
  {
    name: "CanUseNewDashboardBuilder",
    permissionsRequired: ["ManageDashboards"],
  },
  {
    name: "ScheduleReports",
    permissionsRequired: ["EditReports", "RunReports"],
  },
  {
    name: "EditReports",
    permissionsRequired: ["RunReports"],
  },
  {
    name: "ModifyAllData",
    permissionsRequired: ["EditPublicReports", "ManageDashboards"],
  },
  {
    name: "BulkMacrosAllowed",
    objectsAccessRequired: [
      {
        object: "Macro",
        allowCreate: "false",
        allowDelete: "false",
        allowEdit: "false",
        allowRead: "true",
        modifyAllRecords: "false",
        viewAllRecords: "false",
      },
    ],
  },
  {
    name: "ManageSolutions",
    objectsAccessRequired: [
      {
        object: "Solution",
        allowCreate: "true",
        allowDelete: "true",
        allowEdit: "true",
        allowRead: "true",
        modifyAllRecords: "false",
        viewAllRecords: "false",
      },
    ],
  },
  {
    name: "ManageCssUsers",
    objectsAccessRequired: [
      {
        object: "Contact",
        allowCreate: "true",
        allowDelete: "false",
        allowEdit: "true",
        allowRead: "true",
        modifyAllRecords: "false",
        viewAllRecords: "false",
      },
    ],
  },
  {
    name: "TransferAnyCase",
    objectsAccessRequired: [
      {
        object: "Case",
        allowCreate: "true",
        allowDelete: "false",
        allowEdit: "false",
        allowRead: "true",
        modifyAllRecords: "false",
        viewAllRecords: "false",
      },
    ],
  },
];
class UserPermissionBuilder {
  static addPermissionDependencies(profileOrPermissionSet) {
    let objectAccessRequired = [];
    for (let i = 0; i < userPermissionDependencies.length; i++) {
      let dependedPermission = userPermissionDependencies[i];
      if (
        profileOrPermissionSet.userPermissions != null &&
        profileOrPermissionSet.userPermissions.length > 0
      ) {
        for (
          let j = 0;
          j < profileOrPermissionSet.userPermissions.length;
          j++
        ) {
          let permission = profileOrPermissionSet.userPermissions[j];
          if (permission.name == dependedPermission.name) {
            objectAccessRequired.push(
              ...dependedPermission.objectsAccessRequired
            );
          }
        }
      }
    }
    if (objectAccessRequired.length > 0) {
      UserPermissionBuilder.addRequiredObjectAccess(
        profileOrPermissionSet,
        UserPermissionBuilder.mergeObjectAccess(objectAccessRequired)
      );
    }
  }
  static mergeObjectAccess(objectAccessRequired) {
    var objectMapping = {};
    for (var i = 0; i < objectAccessRequired.length; i++) {
      var objectAccess = objectAccessRequired[i];
      if (objectMapping[objectAccess.object] != undefined) {
        //console.log('Adding access');
        UserPermissionBuilder.addAccess(
          objectMapping[objectAccess.object],
          objectAccess
        );
      } else {
        //console.log('object access does not exists ');
        objectMapping[objectAccess.object] = objectAccess;
      }
    }
    return Object.values(objectMapping);
  }
  static addAccess(objectAccess1, ObjectAccess2) {
    objectAccess1.allowCreate =
      objectAccess1.allowCreate.toString() === "true"
        ? true
        : ObjectAccess2.allowCreate;
    objectAccess1.allowDelete =
      objectAccess1.allowDelete.toString() === "true"
        ? true
        : ObjectAccess2.allowDelete;
    objectAccess1.allowEdit =
      objectAccess1.allowEdit.toString() === "true"
        ? true
        : ObjectAccess2.allowEdit;
    objectAccess1.allowRead =
      objectAccess1.allowRead.toString() === "true"
        ? true
        : ObjectAccess2.allowRead;
    objectAccess1.modifyAllRecords =
      objectAccess1.modifyAllRecords.toString() === true
        ? true
        : ObjectAccess2.modifyAllRecords;
    objectAccess1.viewAllRecords =
      objectAccess1.viewAllRecords.toString() === "true"
        ? true
        : ObjectAccess2.viewAllRecords;
  }
  static addRequiredObjectAccess(profileOrPermissionSet, objectAccessRequired) {
    if (
      profileOrPermissionSet.objectPermissions == null ||
      profileOrPermissionSet.objectPermissions == undefined ||
      !Array.isArray(profileOrPermissionSet.objectPermissions)
    ) {
      profileOrPermissionSet.objectPermissions = objectAccessRequired;
    } else {
      let objectAccesses = objectAccessRequired.filter((objectAccess) => {
        let exist = false;
        for (
          let i = 0;
          i < profileOrPermissionSet.objectPermissions.length;
          i++
        ) {
          let profileObjectAccess = profileOrPermissionSet.objectPermissions[i];
          exist = profileObjectAccess.object == objectAccess.object;
          if (exist) {
            UserPermissionBuilder.addAccess(profileObjectAccess, objectAccess);
            break;
          }
        }
        return !exist;
      });
      if (objectAccesses.length > 0) {
        profileOrPermissionSet.objectPermissions.push(...objectAccesses);
      }
    }
  }
  static describeSObject(conn, sObjectName) {
    return __awaiter(this, void 0, void 0, function* () {
      var toReturn = new Promise((resolve, reject) => {
        conn.sobject(sObjectName).describe(function (err, meta) {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(meta);
        });
      });
      return toReturn;
    });
  }
  static getSupportedPermissions(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      if (_.isNil(UserPermissionBuilder.supportedPermissions)) {
        let describeResult = yield UserPermissionBuilder.describeSObject(
          conn,
          "PermissionSet"
        );
        UserPermissionBuilder.supportedPermissions = [];
        describeResult.fields.forEach((field) => {
          let fieldName = field["name"];
          if (fieldName.startsWith("Permissions")) {
            UserPermissionBuilder.supportedPermissions.push(
              fieldName.replace("Permissions", "").trim()
            );
          }
        });
      }
      return UserPermissionBuilder.supportedPermissions;
    });
  }
  static isSupportedPermission(permission) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      if (!_.isNil(UserPermissionBuilder.supportedPermissions)) {
        found = UserPermissionBuilder.supportedPermissions.includes(permission);
      }
      return found;
    });
  }
  static handlePermissionDependency(
    profileOrPermissionSet,
    supportedPermissions
  ) {
    userPermissionDependencies.forEach((userPermission) => {
      let hasPermission = UserPermissionBuilder.hasPermission(
        profileOrPermissionSet,
        userPermission.name
      );
      if (
        hasPermission &&
        userPermission.hasAccessOnData &&
        profileOrPermissionSet.objectPermissions !== undefined &&
        profileOrPermissionSet.objectPermissions.length > 0
      ) {
        for (
          var i = 0;
          i < profileOrPermissionSet.objectPermissions.length;
          i++
        ) {
          profileOrPermissionSet.objectPermissions[i].allowRead = true;
          profileOrPermissionSet.objectPermissions[i].viewAllRecords = true;
        }
      }
      if (
        hasPermission &&
        userPermission.permissionsRequired !== undefined &&
        userPermission.permissionsRequired.length > 0
      ) {
        for (let i = 0; i < userPermission.permissionsRequired.length; i++) {
          UserPermissionBuilder.enablePermission(
            profileOrPermissionSet,
            userPermission.permissionsRequired[i],
            supportedPermissions
          );
        }
      }
    });
  }
  static enablePermission(profileObj, permissionName, supportedPermission) {
    let found = false;
    if (
      profileObj.userPermissions !== undefined &&
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
      if (_.isNil(profileObj.userPermissions)) {
        profileObj.userPermissions = [];
      }
      if (supportedPermission.includes(permissionName)) {
        let permission = {
          name: permissionName,
          enabled: true,
        };
        profileObj.userPermissions.push(permission);
      }
    }
  }
  static hasPermission(profileOrPermissionSet, permissionName) {
    let found = false;
    if (!_.isNil(profileOrPermissionSet.userPermissions)) {
      for (var i = 0; i < profileOrPermissionSet.userPermissions.length; i++) {
        let element = profileOrPermissionSet.userPermissions[i];
        if (element.name === permissionName) {
          found = element.enabled;
          break;
        }
      }
    }
    return found;
  }
}
exports.default = UserPermissionBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlclBlcm1pc3Npb25CdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvYnVpbGRlci91c2VyUGVybWlzc2lvbkJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsMENBQTRCO0FBRTVCLE1BQU0sMEJBQTBCLEdBQUc7SUFDakM7UUFDRSxJQUFJLEVBQUUsYUFBYTtRQUNuQixtQkFBbUIsRUFBRSxDQUFDLG9CQUFvQixFQUFFLHVCQUF1QixDQUFDO1FBQ3BFLGVBQWUsRUFBRSxJQUFJO0tBQ3RCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsZUFBZTtRQUNyQixlQUFlLEVBQUUsSUFBSTtLQUN0QjtJQUNEO1FBQ0UsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixtQkFBbUIsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDO0tBQ3BFO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsMkJBQTJCO1FBQ2pDLG1CQUFtQixFQUFFLENBQUMsa0JBQWtCLENBQUM7S0FDMUM7SUFDRDtRQUNFLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsbUJBQW1CLEVBQUUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDO0tBQ25EO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsYUFBYTtRQUNuQixtQkFBbUIsRUFBRSxDQUFDLFlBQVksQ0FBQztLQUNwQztJQUNEO1FBQ0UsSUFBSSxFQUFFLGVBQWU7UUFDckIsbUJBQW1CLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQztLQUMvRDtJQUNEO1FBQ0UsSUFBSSxFQUFFLG1CQUFtQjtRQUN6QixxQkFBcUIsRUFBRTtZQUNyQjtnQkFDRSxNQUFNLEVBQUUsT0FBTztnQkFDZixXQUFXLEVBQUUsT0FBTztnQkFDcEIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixTQUFTLEVBQUUs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
