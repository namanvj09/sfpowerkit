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
const sfpowerkit_1 = require("../../../sfpowerkit");
const metadataFiles_1 = __importDefault(
  require("../../metadata/metadataFiles")
);
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const xml2js = __importStar(require("xml2js"));
const metadataInfo_1 = require("../../metadata/metadataInfo");
const customApplicationRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/customApplicationRetriever")
);
const apexClassRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/apexClassRetriever")
);
const fieldRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/fieldRetriever")
);
const layoutRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/layoutRetriever")
);
const recordTypeRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/recordTypeRetriever")
);
const entityDefinitionRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/entityDefinitionRetriever")
);
const apexPageRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/apexPageRetriever")
);
const tabDefinitionRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/tabDefinitionRetriever")
);
const userLicenseRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/userLicenseRetriever")
);
const userPermissionBuilder_1 = __importDefault(
  require("../../../impl/metadata/builder/userPermissionBuilder")
);
const util = __importStar(require("util"));
const _ = __importStar(require("lodash"));
const profileActions_1 = __importDefault(require("./profileActions"));
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const profileWriter_1 = __importDefault(
  require("../../../impl/metadata/writer/profileWriter")
);
const core_1 = require("@salesforce/core");
const externalDataSourceRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/externalDataSourceRetriever")
);
const flowRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/flowRetriever")
);
const customPermissionRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/customPermissionRetriever")
);
const nonArayProperties = [
  "custom",
  "description",
  "fullName",
  "userLicense",
  "$",
];
class ProfileReconcile extends profileActions_1.default {
  reconcile(srcFolders, profileList, destFolder) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!_.isNil(destFolder)) {
        fileutils_1.default.mkDirByPathSync(destFolder);
      }
      if (_.isNil(srcFolders) || srcFolders.length === 0) {
        srcFolders = yield sfpowerkit_1.SFPowerkit.getProjectDirectories();
      }
      let result = [];
      this.metadataFiles = new metadataFiles_1.default();
      srcFolders.forEach((srcFolder) => {
        let normalizedPath = path.join(process.cwd(), srcFolder);
        this.metadataFiles.loadComponents(normalizedPath);
      });
      profileList = profileList.map((element) => {
        return element + metadataInfo_1.METADATA_INFO.Profile.sourceExtension;
      });
      if (!metadataFiles_1.default.sourceOnly) {
        yield this.profileRetriever.loadSupportedPermissions();
      }
      for (
        let count = 0;
        count < metadataInfo_1.METADATA_INFO.Profile.files.length;
        count++
      ) {
        let profileComponent =
          metadataInfo_1.METADATA_INFO.Profile.files[count];
        if (
          profileList.length == 0 ||
          profileList.includes(path.basename(profileComponent))
        ) {
          sfpowerkit_1.SFPowerkit.log(
            "Reconciling profile " + path.basename(profileComponent),
            core_1.LoggerLevel.INFO
          );
          let profileXmlString = fs.readFileSync(profileComponent);
          const parser = new xml2js.Parser({ explicitArray: true });
          const parseString = util.promisify(parser.parseString);
          let parseResult = yield parseString(profileXmlString);
          let profileWriter = new profileWriter_1.default();
          let profileObj = profileWriter.toProfile(parseResult.Profile); // as Profile
          profileObj = yield this.removePermissions(profileObj);
          if (!metadataFiles_1.default.sourceOnly) {
            //Manage licences
            let licenceUtils = userLicenseRetriever_1.default.getInstance(
              this.org
            );
            const isSupportedLicence = yield licenceUtils.userLicenseExists(
              profileObj.userLicense
            );
            if (!isSupportedLicence) {
              delete profileObj.userLicense;
            }
          }
          // remove unsupported userPermission
          let unsupportedLicencePermissions = this.profileRetriever.getUnsupportedLicencePermissions(
            profileObj.userLicense
          );
          if (
            profileObj.userPermissions != null &&
            profileObj.userPermissions.length > 0
          ) {
            profileObj.userPermissions = profileObj.userPermissions.filter(
              (permission) => {
                let supported = !unsupportedLicencePermissions.includes(
                  permission.name
                );
                return supported;
              }
            );
          }
          //IS sourceonly, use ignorePermission set in sfdxProject.json file
          if (metadataFiles_1.default.sourceOnly) {
            let pluginConfig = yield sfpowerkit_1.SFPowerkit.getConfig();
            let ignorePermissions = pluginConfig.ignoredPermissions || [];
            if (
              profileObj.userPermissions !== undefined &&
              profileObj.userPermissions.length > 0
            ) {
              profileObj.userPermissions = profileObj.userPermissions.filter(
                (permission) => {
                  let supported = !ignorePermissions.includes(permission.name);
                  return supported;
                }
              );
            }
          } else {
            if (
              profileObj.userPermissions !== undefined &&
              profileObj.userPermissions.length > 0
            ) {
              //Remove permission that are not present in the target org
              profileObj.userPermissions = profileObj.userPermissions.filter(
                (permission) => {
                  let supported = this.profileRetriever.supportedPermissions.includes(
                    permission.name
                  );
                  return supported;
                }
              );
            }
          }
          //UserPermissionUtils.addPermissionDependencies(profileObj);
          let isCustom = "" + profileObj.custom;
          if (isCustom == "false") {
            delete profileObj.userPermissions;
          }
          //this.handleViewAllDataPermission(profileObj);
          //this.handleInstallPackagingPermission(profileObj);
          //this.handleQueryAllFilesPermission(profileObj);
          userPermissionBuilder_1.default.handlePermissionDependency(
            profileObj,
            this.profileRetriever.supportedPermissions
          );
          let outputFile = profileComponent;
          if (!_.isNil(destFolder)) {
            outputFile = path.join(destFolder, path.basename(profileComponent));
          }
          profileWriter.writeProfile(profileObj, outputFile);
          result.push(outputFile);
        }
      }
      return result;
    });
  }
  reconcileApp(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = customApplicationRetriever_1.default.getInstance(this.org);
      if (profileObj.applicationVisibilities !== undefined) {
        let validArray = [];
        for (let i = 0; i < profileObj.applicationVisibilities.length; i++) {
          let cmpObj = profileObj.applicationVisibilities[i];
          let exist = yield utils.appExists(cmpObj.application);
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Application Visiblitilties reduced from ${profileObj.applicationVisibilities.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.applicationVisibilities = validArray;
      }
      return profileObj;
    });
  }
  reconcileClasses(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = apexClassRetriever_1.default.getInstance(this.org);
      if (profileObj.classAccesses !== undefined) {
        if (!Array.isArray(profileObj.classAccesses)) {
          profileObj.classAccesses = [profileObj.classAccesses];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.classAccesses.length; i++) {
          let cmpObj = profileObj.classAccesses[i];
          let exists = yield utils.classExists(cmpObj.apexClass);
          if (exists) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Class Access reduced from ${profileObj.classAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.classAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileFields(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = fieldRetriever_1.default.getInstance(this.org);
      if (profileObj.fieldLevelSecurities !== undefined) {
        if (!Array.isArray(profileObj.fieldLevelSecurities)) {
          profileObj.fieldLevelSecurities = [profileObj.fieldLevelSecurities];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.fieldLevelSecurities.length; i++) {
          let cmpObj = profileObj.fieldLevelSecurities[i];
          let exists = yield utils.fieldExist(cmpObj.field);
          if (exists) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Fields Level Security reduced from ${profileObj.fieldLevelSecurities.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.fieldLevelSecurities = validArray;
      }
      if (profileObj.fieldPermissions !== undefined) {
        if (!Array.isArray(profileObj.fieldPermissions)) {
          profileObj.fieldPermissions = [profileObj.fieldPermissions];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.fieldPermissions.length; i++) {
          let cmpObj = profileObj.fieldPermissions[i];
          let exists = yield utils.fieldExist(cmpObj.field);
          if (exists) {
            validArray.push(cmpObj);
          }
        }
        profileObj.fieldPermissions = validArray;
      }
      return profileObj;
    });
  }
  reconcileLayouts(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = layoutRetriever_1.default.getInstance(this.org);
      let rtUtils = recordTypeRetriever_1.default.getInstance(this.org);
      if (profileObj.layoutAssignments !== undefined) {
        var validArray = [];
        for (
          let count = 0;
          count < profileObj.layoutAssignments.length;
          count++
        ) {
          let cmpObj = profileObj.layoutAssignments[count];
          let exist =
            (yield utils.layoutExists(cmpObj.layout)) &&
            (_.isNil(cmpObj.recordType) ||
              (yield rtUtils.recordTypeExists(cmpObj.recordType)));
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Layout Assignnments reduced from ${profileObj.layoutAssignments.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.layoutAssignments = validArray;
      }
      return profileObj;
    });
  }
  reconcileObjects(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = entityDefinitionRetriever_1.default.getInstance(this.org);
      if (profileObj.objectPermissions !== undefined) {
        if (!Array.isArray(profileObj.objectPermissions)) {
          profileObj.objectPermissions = [profileObj.objectPermissions];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.objectPermissions.length; i++) {
          let cmpObj = profileObj.objectPermissions[i];
          let exist = yield utils.existObjectPermission(cmpObj.object);
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Object Permissions reduced from ${profileObj.objectPermissions.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.objectPermissions = validArray;
      }
      return profileObj;
    });
  }
  reconcileCustomMetadata(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = entityDefinitionRetriever_1.default.getInstance(this.org);
      if (profileObj.customMetadataTypeAccesses !== undefined) {
        if (!Array.isArray(profileObj.customMetadataTypeAccesses)) {
          profileObj.customMetadataTypeAccesses = [
            profileObj.customMetadataTypeAccesses,
          ];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.customMetadataTypeAccesses.length; i++) {
          let cmpCM = profileObj.customMetadataTypeAccesses[i];
          let exist = yield utils.existCustomMetadata(cmpCM.name);
          if (exist) {
            validArray.push(cmpCM);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `CustomMetadata Access reduced from ${profileObj.customMetadataTypeAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.customMetadataTypeAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileCustomSettins(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = entityDefinitionRetriever_1.default.getInstance(this.org);
      if (profileObj.customSettingAccesses !== undefined) {
        if (!Array.isArray(profileObj.customSettingAccesses)) {
          profileObj.customSettingAccesses = [profileObj.customSettingAccesses];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.customSettingAccesses.length; i++) {
          let cmpCS = profileObj.customSettingAccesses[i];
          let exist = yield utils.existCustomMetadata(cmpCS.name);
          if (exist) {
            validArray.push(cmpCS);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `CustomSettings Access reduced from ${profileObj.customSettingAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.customSettingAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileExternalDataSource(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = externalDataSourceRetriever_1.default.getInstance(this.org);
      if (profileObj.externalDataSourceAccesses !== undefined) {
        if (!Array.isArray(profileObj.externalDataSourceAccesses)) {
          profileObj.externalDataSourceAccesses = [
            profileObj.externalDataSourceAccesses,
          ];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.externalDataSourceAccesses.length; i++) {
          let dts = profileObj.externalDataSourceAccesses[i];
          let exist = yield utils.externalDataSourceExists(
            dts.externalDataSource
          );
          if (exist) {
            validArray.push(dts);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `ExternalDataSource Access reduced from ${profileObj.externalDataSourceAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.externalDataSourceAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileFlow(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = flowRetriever_1.default.getInstance(this.org);
      if (profileObj.flowAccesses !== undefined) {
        if (!Array.isArray(profileObj.flowAccesses)) {
          profileObj.flowAccesses = [profileObj.flowAccesses];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.flowAccesses.length; i++) {
          let flow = profileObj.flowAccesses[i];
          let exist = yield utils.flowExists(flow.flow);
          if (exist) {
            validArray.push(flow);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Flow Access reduced from ${profileObj.flowAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.flowAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileCustomPermission(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = customPermissionRetriever_1.default.getInstance(this.org);
      if (profileObj.customPermissions !== undefined) {
        if (!Array.isArray(profileObj.customPermissions)) {
          profileObj.customPermissions = [profileObj.customPermissions];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.customPermissions.length; i++) {
          let customPermission = profileObj.customPermissions[i];
          let exist = yield utils.customPermissionExists(customPermission.name);
          if (exist) {
            validArray.push(customPermission);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `CustomPermission reduced from ${profileObj.customPermissions.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.customPermissions = validArray;
      }
      return profileObj;
    });
  }
  reconcilePages(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = apexPageRetriever_1.default.getInstance(this.org);
      if (profileObj.pageAccesses !== undefined) {
        if (!Array.isArray(profileObj.pageAccesses)) {
          profileObj.pageAccesses = [profileObj.pageAccesses];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.pageAccesses.length; i++) {
          let cmpObj = profileObj.pageAccesses[i];
          let exist = yield utils.pageExists(cmpObj.apexPage);
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Page Access Permissions reduced from ${profileObj.pageAccesses.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.pageAccesses = validArray;
      }
      return profileObj;
    });
  }
  reconcileRecordTypes(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = recordTypeRetriever_1.default.getInstance(this.org);
      if (profileObj.recordTypeVisibilities !== undefined) {
        if (!Array.isArray(profileObj.recordTypeVisibilities)) {
          profileObj.recordTypeVisibilities = [
            profileObj.recordTypeVisibilities,
          ];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.recordTypeVisibilities.length; i++) {
          let cmpObj = profileObj.recordTypeVisibilities[i];
          let exist = yield utils.recordTypeExists(cmpObj.recordType);
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Record Type Visibilities reduced from ${profileObj.recordTypeVisibilities.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.recordTypeVisibilities = validArray;
      }
      return profileObj;
    });
  }
  reconcileTabs(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      let utils = tabDefinitionRetriever_1.default.getInstance(this.org);
      if (profileObj.tabVisibilities !== undefined) {
        if (!Array.isArray(profileObj.tabVisibilities)) {
          profileObj.tabVisibilities = [profileObj.tabVisibilities];
        }
        let validArray = [];
        for (let i = 0; i < profileObj.tabVisibilities.length; i++) {
          let cmpObj = profileObj.tabVisibilities[i];
          let exist = yield utils.tabExists(cmpObj.tab);
          if (exist) {
            validArray.push(cmpObj);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Tab Visibilities reduced from ${profileObj.tabVisibilities.length}  to  ${validArray.length}`,
          core_1.LoggerLevel.DEBUG
        );
        profileObj.tabVisibilities = validArray;
      }
      return profileObj;
    });
  }
  removePermissions(profileObj) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log("Reconciling App", core_1.LoggerLevel.DEBUG);
      profileObj = yield this.reconcileApp(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Classes",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileClasses(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Fields",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileFields(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Objects",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileObjects(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Pages",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcilePages(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Layouts",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileLayouts(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling Record Types",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileRecordTypes(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  Tabs",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileTabs(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  ExternalDataSources",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileExternalDataSource(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  CustomPermissions",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileCustomPermission(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  CustomMetadata",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileCustomMetadata(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  CustomSettings",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileCustomSettins(profileObj);
      sfpowerkit_1.SFPowerkit.log(
        "Reconciling  Flow",
        core_1.LoggerLevel.DEBUG
      );
      profileObj = yield this.reconcileFlow(profileObj);
      return profileObj;
    });
  }
}
exports.default = ProfileReconcile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZVJlY29uY2lsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL3NvdXJjZS9wcm9maWxlcy9wcm9maWxlUmVjb25jaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUFpRDtBQUNqRCxpRkFBeUQ7QUFDekQsNkNBQStCO0FBQy9CLDJDQUE2QjtBQUM3QiwrQ0FBaUM7QUFDakMsOERBQTREO0FBQzVELDZIQUFxRztBQUNyRyw2R0FBcUY7QUFDckYscUdBQTZFO0FBQzdFLHVHQUErRTtBQUMvRSwrR0FBdUY7QUFDdkYsMkhBQW1HO0FBQ25HLDJHQUFtRjtBQUNuRixxSEFBNkY7QUFDN0YsaUhBQXlGO0FBQ3pGLGlIQUF5RjtBQUV6RiwyQ0FBNkI7QUFDN0IsMENBQTRCO0FBQzVCLHNFQUE4QztBQUM5Qyx5RUFBaUQ7QUFDakQsZ0dBQXdFO0FBQ3hFLDJDQUErQztBQUMvQywrSEFBdUc7QUFDdkcsbUdBQTJFO0FBQzNFLDJIQUFtRztBQUVuRyxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLFFBQVE7SUFDUixhQUFhO0lBQ2IsVUFBVTtJQUNWLGFBQWE7SUFDYixHQUFHO0NBQ0osQ0FBQztBQUVGLE1BQXFCLGdCQUFpQixTQUFRLHdCQUFjO0lBRzdDLFNBQVMsQ0FDcEIsVUFBb0IsRUFDcEIsV0FBcUIsRUFDckIsVUFBa0I7O1lBRWxCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN4QixtQkFBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2QztZQUVELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEQsVUFBVSxHQUFHLE1BQU0sdUJBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2FBQ3ZE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
