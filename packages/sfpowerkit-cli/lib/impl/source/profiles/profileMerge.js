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
const _ = __importStar(require("lodash"));
const util = __importStar(require("util"));
const profileActions_1 = __importDefault(require("./profileActions"));
const profileWriter_1 = __importDefault(
  require("../../../impl/metadata/writer/profileWriter")
);
const unsupportedprofiles = [];
class ProfileMerge extends profileActions_1.default {
  mergeApps(profileObj, applicationVisibilities) {
    if (
      profileObj.applicationVisibilities === null ||
      profileObj.applicationVisibilities === undefined
    ) {
      profileObj.applicationVisibilities = [];
    } else if (!Array.isArray(profileObj.applicationVisibilities)) {
      profileObj.applicationVisibilities = [profileObj.applicationVisibilities];
    }
    for (var i = 0; i < applicationVisibilities.length; i++) {
      let appVisibility = applicationVisibilities[i];
      let found = false;
      for (var j = 0; j < profileObj.applicationVisibilities.length; j++) {
        if (
          appVisibility.application ===
          profileObj.applicationVisibilities[j].application
        ) {
          profileObj.applicationVisibilities[j].default = appVisibility.default;
          profileObj.applicationVisibilities[j].visible = appVisibility.visible;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.applicationVisibilities.push(appVisibility);
      }
    }
    profileObj.applicationVisibilities.sort((app1, app2) => {
      let order = 0;
      if (app1.application < app2.application) {
        order = -1;
      } else if (app1.application > app2.application) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeClasses(profileObj, classes) {
    if (
      profileObj.classAccesses === null ||
      profileObj.classAccesses === undefined
    ) {
      profileObj.classAccesses = [];
    } else if (!Array.isArray(profileObj.classAccesses)) {
      profileObj.classAccesses = [profileObj.classAccesses];
    }
    for (var i = 0; i < classes.length; i++) {
      let classAccess = classes[i];
      let found = false;
      for (var j = 0; j < profileObj.classAccesses.length; j++) {
        if (classAccess.apexClass === profileObj.classAccesses[j].apexClass) {
          profileObj.classAccesses[j].enabled = classAccess.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.classAccesses.push(classAccess);
      }
    }
    profileObj.classAccesses.sort((class1, class2) => {
      let order = 0;
      if (class1.apexClass < class2.apexClass) {
        order = -1;
      } else if (class1.apexClass > class2.apexClass) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeFields(profileObj, fieldPermissions) {
    if (
      profileObj.fieldPermissions === null ||
      profileObj.fieldPermissions === undefined
    ) {
      profileObj.fieldPermissions = [];
    } else if (!Array.isArray(profileObj.fieldPermissions)) {
      profileObj.fieldPermissions = [profileObj.fieldPermissions];
    }
    for (var i = 0; i < fieldPermissions.length; i++) {
      let fieldPermission = fieldPermissions[i];
      let found = false;
      for (var j = 0; j < profileObj.fieldPermissions.length; j++) {
        if (fieldPermission.field === profileObj.fieldPermissions[j].field) {
          profileObj.fieldPermissions[j].editable = fieldPermission.editable;
          if (
            fieldPermission.hidden !== undefined &&
            fieldPermission.hidden !== null
          ) {
            profileObj.fieldPermissions[j].hidden = fieldPermission.hidden;
          }
          profileObj.fieldPermissions[j].readable = fieldPermission.readable;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.fieldPermissions.push(fieldPermission);
      }
    }
    profileObj.fieldPermissions.sort((field1, field2) => {
      let order = 0;
      if (field1.field < field2.field) {
        order = -1;
      } else if (field1.field > field2.field) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeLayouts(profileObj, layoutAssignments) {
    if (
      profileObj.layoutAssignments === null ||
      profileObj.layoutAssignments === undefined
    ) {
      profileObj.layoutAssignments = [];
    } else if (!Array.isArray(profileObj.layoutAssignments)) {
      profileObj.layoutAssignments = [profileObj.layoutAssignments];
    }
    for (var i = 0; i < layoutAssignments.length; i++) {
      let layoutAssignment = layoutAssignments[i];
      let objName = layoutAssignment.layout.split("-")[0];
      profileObj.layoutAssignments = profileObj.layoutAssignments.filter(
        (layoutAss) => {
          const otherObjName = layoutAss.layout.split("-")[0];
          return objName !== otherObjName;
        }
      );
    }
    for (var i = 0; i < layoutAssignments.length; i++) {
      let layoutAssignment = layoutAssignments[i];
      let found = false;
      for (var j = 0; j < profileObj.layoutAssignments.length; j++) {
        if (
          layoutAssignment.layout === profileObj.layoutAssignments[j].layout &&
          layoutAssignment.recordType ===
            profileObj.layoutAssignments[j].recordType
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.layoutAssignments.push(layoutAssignment);
      }
    }
    profileObj.layoutAssignments.sort((layout1, layout2) => {
      let order = 0;
      if (layout1.layout === layout2.layout) {
        if (layout1.recordType === undefined) {
          order = -1;
        } else if (layout1.recordType < layout2.recordType) {
          order = -1;
        } else {
          order = 1;
        }
      } else {
        if (layout1.layout < layout2.layout) {
          order = -1;
        } else if (layout1.layout > layout2.layout) {
          order = 1;
        }
      }
      return order;
    });
    return profileObj;
  }
  mergeObjects(profileObj, objectPermissions) {
    if (
      profileObj.objectPermissions === null ||
      profileObj.objectPermissions === undefined
    ) {
      profileObj.objectPermissions = [];
    } else if (!Array.isArray(profileObj.objectPermissions)) {
      profileObj.objectPermissions = [profileObj.objectPermissions];
    }
    for (var i = 0; i < objectPermissions.length; i++) {
      let objPerm = objectPermissions[i];
      let found = false;
      for (var j = 0; j < profileObj.objectPermissions.length; j++) {
        if (objPerm.object === profileObj.objectPermissions[j].object) {
          profileObj.objectPermissions[j].allowCreate = objPerm.allowCreate;
          profileObj.objectPermissions[j].allowDelete = objPerm.allowDelete;
          profileObj.objectPermissions[j].allowEdit = objPerm.allowEdit;
          profileObj.objectPermissions[j].allowRead = objPerm.allowRead;
          profileObj.objectPermissions[j].modifyAllRecords =
            objPerm.modifyAllRecords;
          profileObj.objectPermissions[j].viewAllRecords =
            objPerm.viewAllRecords;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.objectPermissions.push(objPerm);
      }
    }
    profileObj.objectPermissions.sort((obj1, obj2) => {
      let order = 0;
      if (obj1.object < obj2.object) {
        order = -1;
      } else if (obj1.object > obj2.object) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergePages(profileObj, pages) {
    if (
      profileObj.pageAccesses === null ||
      profileObj.pageAccesses === undefined
    ) {
      profileObj.pageAccesses = [];
    } else if (!Array.isArray(profileObj.pageAccesses)) {
      profileObj.pageAccesses = [profileObj.pageAccesses];
    }
    for (var i = 0; i < pages.length; i++) {
      let page = pages[i];
      let found = false;
      for (var j = 0; j < profileObj.pageAccesses.length; j++) {
        if (page.apexPage === profileObj.pageAccesses[j].apexPage) {
          profileObj.pageAccesses[j].enabled = page.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.pageAccesses.push(page);
      }
    }
    profileObj.pageAccesses.sort((page1, page2) => {
      let order = 0;
      if (page1.apexPage < page2.apexPage) {
        order = -1;
      } else if (page1.apexPage > page2.apexPage) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeRecordTypes(profileObj, recordTypes) {
    if (
      profileObj.recordTypeVisibilities === null ||
      profileObj.recordTypeVisibilities === undefined
    ) {
      profileObj.recordTypeVisibilities = [];
    } else if (!Array.isArray(profileObj.recordTypeVisibilities)) {
      profileObj.recordTypeVisibilities = [profileObj.recordTypeVisibilities];
    }
    for (var i = 0; i < recordTypes.length; i++) {
      let recordType = recordTypes[i];
      let found = false;
      for (var j = 0; j < profileObj.recordTypeVisibilities.length; j++) {
        if (
          recordType.recordType ===
          profileObj.recordTypeVisibilities[j].recordType
        ) {
          profileObj.recordTypeVisibilities[j].default = recordType.default;
          if (
            recordType.personAccountDefault !== undefined &&
            recordType.personAccountDefault !== null
          ) {
            profileObj.recordTypeVisibilities[j].personAccountDefault =
              recordType.personAccountDefault;
          }
          profileObj.recordTypeVisibilities[j].visible = recordType.visible;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.recordTypeVisibilities.push(recordType);
      }
    }
    profileObj.recordTypeVisibilities.sort((recordtype1, recordtype2) => {
      let order = 0;
      if (recordtype1.recordType < recordtype2.recordType) {
        order = -1;
      } else if (recordtype1.recordType > recordtype2.recordType) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeTabs(profileObj, tabs) {
    if (
      profileObj.tabVisibilities === null ||
      profileObj.tabVisibilities === undefined
    ) {
      profileObj.tabVisibilities = [];
    } else if (!Array.isArray(profileObj.tabVisibilities)) {
      profileObj.tabVisibilities = [profileObj.tabVisibilities];
    }
    for (var i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      let found = false;
      for (var j = 0; j < profileObj.tabVisibilities.length; j++) {
        if (tab.tab === profileObj.tabVisibilities[j].tab) {
          profileObj.tabVisibilities[j].visibility = tab.visibility;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.tabVisibilities.push(tab);
      }
    }
    profileObj.tabVisibilities.sort((tab1, tab2) => {
      let order = 0;
      if (tab1.tab < tab2.tab) {
        order = -1;
      } else if (tab1.tab > tab2.tab) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergePermissions(profileObj, permissions) {
    if (
      profileObj.userPermissions === null ||
      profileObj.userPermissions === undefined
    ) {
      profileObj.userPermissions = [];
    } else if (!Array.isArray(profileObj.userPermissions)) {
      profileObj.userPermissions = [profileObj.userPermissions];
    }
    for (let i = 0; i < permissions.length; i++) {
      let perm = permissions[i];
      let found = false;
      for (let j = 0; j < profileObj.userPermissions.length; j++) {
        if (perm.name === profileObj.userPermissions[j].name) {
          profileObj.userPermissions[j].enabled = perm.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.userPermissions.push(perm);
      }
    }
    profileObj.userPermissions.sort((perm1, perm2) => {
      let order = 0;
      if (perm1.name < perm2.name) {
        order = -1;
      } else if (perm1.name > perm2.name) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeCustomPermissions(profileObj, permissions) {
    if (
      profileObj.customPermissions === null ||
      profileObj.customPermissions === undefined
    ) {
      profileObj.customPermissions = [];
    } else if (!Array.isArray(profileObj.customPermissions)) {
      profileObj.customPermissions = [profileObj.customPermissions];
    }
    for (let i = 0; i < permissions.length; i++) {
      let perm = permissions[i];
      let found = false;
      for (let j = 0; j < profileObj.customPermissions.length; j++) {
        if (perm.name === profileObj.customPermissions[j].name) {
          profileObj.customPermissions[j].enabled = perm.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.customPermissions.push(perm);
      }
    }
    profileObj.customPermissions.sort((perm1, perm2) => {
      let order = 0;
      if (perm1.name < perm2.name) {
        order = -1;
      } else if (perm1.name > perm2.name) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeCustomMetadataAccesses(profileObj, custonMetadataAccesses) {
    if (
      profileObj.customMetadataTypeAccesses === null ||
      profileObj.customMetadataTypeAccesses === undefined
    ) {
      profileObj.customMetadataTypeAccesses = [];
    } else if (!Array.isArray(profileObj.customMetadataTypeAccesses)) {
      profileObj.customMetadataTypeAccesses = [
        profileObj.customMetadataTypeAccesses,
      ];
    }
    for (let i = 0; i < custonMetadataAccesses.length; i++) {
      let customMetadata = custonMetadataAccesses[i];
      let found = false;
      for (let j = 0; j < profileObj.customMetadataTypeAccesses.length; j++) {
        if (
          customMetadata.name === profileObj.customMetadataTypeAccesses[j].name
        ) {
          profileObj.customMetadataTypeAccesses[j].enabled =
            customMetadata.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.customMetadataTypeAccesses.push(customMetadata);
      }
    }
    profileObj.customMetadataTypeAccesses.sort((cm1, cm2) => {
      let order = 0;
      if (cm1.name < cm2.name) {
        order = -1;
      } else if (cm1.name > cm2.name) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeCustomSettingAccesses(profileObj, customSettingAccesses) {
    if (
      profileObj.customSettingAccesses === null ||
      profileObj.customSettingAccesses === undefined
    ) {
      profileObj.customSettingAccesses = [];
    } else if (!Array.isArray(profileObj.customSettingAccesses)) {
      profileObj.customSettingAccesses = [profileObj.customSettingAccesses];
    }
    for (let i = 0; i < customSettingAccesses.length; i++) {
      let customSetting = customSettingAccesses[i];
      let found = false;
      for (let j = 0; j < profileObj.customSettingAccesses.length; j++) {
        if (customSetting.name === profileObj.customSettingAccesses[j].name) {
          profileObj.customSettingAccesses[j].enabled = customSetting.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.customSettingAccesses.push(customSetting);
      }
    }
    profileObj.customSettingAccesses.sort((cs1, cs2) => {
      let order = 0;
      if (cs1.name < cs2.name) {
        order = -1;
      } else if (cs1.name > cs2.name) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeFlowAccesses(profileObj, flowAccesses) {
    if (
      profileObj.flowAccesses === null ||
      profileObj.flowAccesses === undefined
    ) {
      profileObj.flowAccesses = [];
    } else if (!Array.isArray(profileObj.flowAccesses)) {
      profileObj.flowAccesses = [profileObj.flowAccesses];
    }
    for (let i = 0; i < flowAccesses.length; i++) {
      let flowAccess = flowAccesses[i];
      let found = false;
      for (let j = 0; j < profileObj.flowAccesses.length; j++) {
        if (flowAccess.flow === profileObj.flowAccesses[j].flow) {
          profileObj.flowAccesses[j].enabled = flowAccess.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.flowAccesses.push(flowAccess);
      }
    }
    profileObj.flowAccesses.sort((flow1, flow2) => {
      let order = 0;
      if (flow1.flow < flow2.flow) {
        order = -1;
      } else if (flow1.flow > flow2.flow) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  mergeExternalDatasourceAccesses(profileObj, externalDatasources) {
    if (
      profileObj.externalDataSourceAccesses === null ||
      profileObj.externalDataSourceAccesses === undefined
    ) {
      profileObj.externalDataSourceAccesses = [];
    } else if (!Array.isArray(profileObj.externalDataSourceAccesses)) {
      profileObj.externalDataSourceAccesses = [
        profileObj.externalDataSourceAccesses,
      ];
    }
    for (let i = 0; i < externalDatasources.length; i++) {
      let dataSource = externalDatasources[i];
      let found = false;
      for (let j = 0; j < profileObj.externalDataSourceAccesses.length; j++) {
        if (
          dataSource.externalDataSource ===
          profileObj.externalDataSourceAccesses[j].externalDataSource
        ) {
          profileObj.externalDataSourceAccesses[j].enabled = dataSource.enabled;
          found = true;
          break;
        }
      }
      if (!found) {
        profileObj.externalDataSourceAccesses.push(dataSource);
      }
    }
    profileObj.externalDataSourceAccesses.sort((ds1, ds2) => {
      let order = 0;
      if (ds1.externalDataSource < ds2.externalDataSource) {
        order = -1;
      } else if (ds1.externalDataSource > ds2.externalDataSource) {
        order = 1;
      }
      return order;
    });
    return profileObj;
  }
  /**
   * Merge two profile and make sure that profile 1 contains all config present in the profile 2
   * @param profile1
   * @param profile2
   */
  mergeProfile(profile1, profile2) {
    return __awaiter(this, void 0, void 0, function* () {
      if (profile2.applicationVisibilities !== undefined) {
        this.mergeApps(profile1, profile2.applicationVisibilities);
      }
      if (profile2.classAccesses !== undefined) {
        this.mergeClasses(profile1, profile2.classAccesses);
      }
      if (profile2.customMetadataTypeAccesses !== undefined) {
        this.mergeCustomMetadataAccesses(
          profile1,
          profile2.customMetadataTypeAccesses
        );
      }
      if (profile2.customSettingAccesses !== undefined) {
        this.mergeCustomSettingAccesses(
          profile1,
          profile2.customSettingAccesses
        );
      }
      if (profile2.customPermissions !== undefined) {
        this.mergeCustomPermissions(profile1, profile2.customPermissions);
      }
      if (profile2.externalDataSourceAccesses !== undefined) {
        this.mergeExternalDatasourceAccesses(
          profile1,
          profile2.externalDataSourceAccesses
        );
      }
      if (profile2.fieldPermissions !== undefined) {
        this.mergeFields(profile1, profile2.fieldPermissions);
      }
      if (profile2.flowAccesses !== undefined) {
        this.mergeFlowAccesses(profile1, profile2.flowAccesses);
      }
      if (profile2.layoutAssignments !== undefined) {
        this.mergeLayouts(profile1, profile2.layoutAssignments);
      }
      if (profile2.objectPermissions !== undefined) {
        this.mergeObjects(profile1, profile2.objectPermissions);
      }
      if (profile2.pageAccesses !== undefined) {
        this.mergePages(profile1, profile2.pageAccesses);
      }
      if (profile2.userPermissions !== undefined) {
        this.mergePermissions(profile1, profile2.userPermissions);
      }
      if (profile2.recordTypeVisibilities !== undefined) {
        this.mergeRecordTypes(profile1, profile2.recordTypeVisibilities);
      }
      if (profile2.tabVisibilities !== undefined) {
        this.mergeTabs(profile1, profile2.tabVisibilities);
      }
      if (profile2.loginHours !== undefined) {
        profile1.loginHours = profile2.loginHours;
      } else {
        delete profile1.loginHours;
      }
      if (profile2.loginIpRanges !== undefined) {
        profile1.loginIpRanges = profile2.loginIpRanges;
      } else {
        delete profile1.loginIpRanges;
      }
      return profile1;
    });
  }
  merge(srcFolders, profiles, metadatas, isdelete) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Merging profiles...",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      let fetchNewProfiles = _.isNil(srcFolders) || srcFolders.length === 0;
      if (fetchNewProfiles) {
        srcFolders = yield sfpowerkit_1.SFPowerkit.getProjectDirectories();
      }
      this.metadataFiles = new metadataFiles_1.default();
      for (let i = 0; i < srcFolders.length; i++) {
        let srcFolder = srcFolders[i];
        let normalizedPath = path.join(process.cwd(), srcFolder);
        this.metadataFiles.loadComponents(normalizedPath);
      }
      let profileListToReturn = [];
      let profileNames = [];
      var profilePathAssoc = {};
      let profileStatus = yield this.getProfileFullNamesWithLocalStatus(
        profiles
      );
      let metadataFiles = profileStatus.updated || [];
      if (fetchNewProfiles) {
        metadataFiles = _.union(profileStatus.added, profileStatus.updated);
      } else {
        profileStatus.added = [];
      }
      metadataFiles.sort();
      for (var i = 0; i < metadataFiles.length; i++) {
        var profileComponent = metadataFiles[i];
        var profileName = path.basename(
          profileComponent,
          metadataInfo_1.METADATA_INFO.Profile.sourceExtension
        );
        var supported = !unsupportedprofiles.includes(profileName);
        if (supported) {
          profilePathAssoc[profileName] = profileComponent;
          profileNames.push(profileName);
        }
      }
      //SfPowerKit.ux.log("Loading profiles from server ");
      var i,
        j,
        chunk = 10;
      var temparray;
      sfpowerkit_1.SFPowerkit.log(
        `${profileNames.length}  profiles found in the directory `,
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      for (i = 0, j = profileNames.length; i < j; i += chunk) {
        temparray = profileNames.slice(i, i + chunk);
        //SfPowerKit.ux.log(temparray.length);
        let start = i + 1;
        let end = i + chunk;
        sfpowerkit_1.SFPowerkit.log(
          "Loading a chunk of profiles " + start + " to " + end,
          sfpowerkit_1.LoggerLevel.INFO
        );
        let profileList = [];
        var metadataList = yield this.profileRetriever.loadProfiles(
          temparray,
          this.conn
        );
        for (var count = 0; count < metadataList.length; count++) {
          //handle profile merge here
          var profileObjFromServer = metadataList[count];
          if (metadatas !== undefined) {
            //remove metadatas from profile
            profileObjFromServer = this.removeUnwantedPermissions(
              profileObjFromServer,
              metadatas
            );
          }
          //Check if the component exists in the file system
          let filePath = profilePathAssoc[profileObjFromServer.fullName];
          var profileObj = profileObjFromServer;
          let profileWriter = new profileWriter_1.default();
          var exists = fs.existsSync(filePath);
          if (exists) {
            sfpowerkit_1.SFPowerkit.log(
              "Merging profile " + profileObjFromServer.fullName,
              sfpowerkit_1.LoggerLevel.DEBUG
            );
            var profileXml = fs.readFileSync(filePath);
            const parser = new xml2js.Parser({ explicitArray: false });
            const parseString = util.promisify(parser.parseString);
            let parseResult = yield parseString(profileXml);
            profileObj = profileWriter.toProfile(parseResult.Profile);
            yield this.mergeProfile(profileObj, profileObjFromServer);
          } else {
            sfpowerkit_1.SFPowerkit.log(
              "New Profile found in server " + profileObjFromServer.fullName,
              sfpowerkit_1.LoggerLevel.DEBUG
            );
          }
          profileObj.fullName = profileObjFromServer.fullName;
          profileWriter.writeProfile(profileObj, filePath);
          sfpowerkit_1.SFPowerkit.log(
            "Profile " + profileObj.fullName + " merged",
            sfpowerkit_1.LoggerLevel.DEBUG
          );
          profileList.push(profileObj.fullName);
        }
        profileListToReturn.push(...profileList);
      }
      if (profileStatus.deleted && isdelete) {
        profileStatus.deleted.forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      }
      return Promise.resolve(profileStatus);
    });
  }
  removeUnwantedPermissions(profileObjFromServer, metadatas) {
    profileObjFromServer.applicationVisibilities = profileObjFromServer.applicationVisibilities.filter(
      (elem) => {
        return (
          metadatas["CustomApplication"].includes(elem.application) ||
          metadatas["CustomApplication"].includes("*")
        );
      }
    );
    profileObjFromServer.classAccesses = profileObjFromServer.classAccesses.filter(
      (elem) => {
        return (
          metadatas["ApexClass"].includes(elem.apexClass) ||
          metadatas["ApexClass"].includes("*")
        );
      }
    );
    profileObjFromServer.layoutAssignments = profileObjFromServer.layoutAssignments.filter(
      (elem) => {
        return (
          metadatas["Layout"].includes(elem.layout) ||
          metadatas["Layout"].includes("*")
        );
      }
    );
    profileObjFromServer.objectPermissions = profileObjFromServer.objectPermissions.filter(
      (elem) => {
        return (
          metadatas["CustomObject"].includes(elem.object) ||
          metadatas["CustomObject"].includes("*")
        );
      }
    );
    profileObjFromServer.pageAccesses = profileObjFromServer.pageAccesses.filter(
      (elem) => {
        return (
          metadatas["ApexPage"].includes(elem.apexPage) ||
          metadatas["ApexPage"].includes("*")
        );
      }
    );
    profileObjFromServer.fieldPermissions = profileObjFromServer.fieldPermissions.filter(
      (elem) => {
        return metadatas["CustomField"].includes(elem.field);
      }
    );
    profileObjFromServer.recordTypeVisibilities = profileObjFromServer.recordTypeVisibilities.filter(
      (elem) => {
        return metadatas["RecordType"].includes(elem.recordType);
      }
    );
    profileObjFromServer.tabVisibilities = profileObjFromServer.tabVisibilities.filter(
      (elem) => {
        return (
          metadatas["CustomTab"].includes(elem.tab) ||
          metadatas["CustomTab"].includes("*")
        );
      }
    );
    if (metadatas["SystemPermissions"].length == 0) {
      delete profileObjFromServer.userPermissions;
    }
    return profileObjFromServer;
  }
}
exports.default = ProfileMerge;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZU1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvc291cmNlL3Byb2ZpbGVzL3Byb2ZpbGVNZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBOEQ7QUFDOUQsaUZBQXlEO0FBQ3pELDZDQUErQjtBQUMvQiwyQ0FBNkI7QUFDN0IsK0NBQWlDO0FBQ2pDLDhEQUE0RDtBQUM1RCwwQ0FBNEI7QUFpQjVCLDJDQUE2QjtBQUM3QixzRUFBOEM7QUFDOUMsZ0dBQXdFO0FBRXhFLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0FBRS9CLE1BQXFCLFlBQWEsU0FBUSx3QkFBYztJQUc5QyxTQUFTLENBQ2YsVUFBbUIsRUFDbkIsdUJBQWdEO1FBRWhELElBQ0UsVUFBVSxDQUFDLHVCQUF1QixLQUFLLElBQUk7WUFDM0MsVUFBVSxDQUFDLHVCQUF1QixLQUFLLFNBQVMsRUFDaEQ7WUFDQSxVQUFVLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEVBQUU7WUFDN0QsVUFBVSxDQUFDLHVCQUF1QixHQUFHLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDM0U7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZELElBQUksYUFBYSxHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUs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
