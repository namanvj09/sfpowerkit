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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_PERMISSIONSET_EXTENSION = exports.UNSPLITED_METADATA = exports.METADATA_INFO = exports.MetadataInfo = exports.SOURCE_EXTENSION_REGEX = void 0;
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
exports.SOURCE_EXTENSION_REGEX = /\.[a-zA-Z]+-meta\.xml/;
const SPLITED_TYPES = {
  CustomField: {
    suffix: "field",
    folder: "fields",
  },
  BusinessProcess: {
    suffix: "businessProcess",
    folder: "businessProcesses",
  },
  CompactLayout: {
    suffix: "compactLayout",
    folder: "compactLayouts",
  },
  FieldSet: {
    suffix: "fieldSet",
    folder: "fieldSets",
  },
  RecordType: {
    suffix: "recordType",
    folder: "recordTypes",
  },
  ListView: {
    suffix: "listView",
    folder: "listViews",
  },
  SharingReason: {
    suffix: "sharingReason",
    folder: "sharingReasons",
  },
  ValidationRule: {
    suffix: "validationRule",
    folder: "validationRules",
  },
  WebLink: {
    suffix: "webLink",
    folder: "webLinks",
  },
};
class MetadataInfo {
  static loadMetadataInfo() {
    let metadataInfo = {};
    let resourcePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "resources",
      "metadatainfo.json"
    );
    const fileData = fs.readFileSync(resourcePath, "utf8");
    let metadataInfoJSON = JSON.parse(fileData);
    metadataInfoJSON.metadataObjects.forEach((metadata) => {
      let metadataDescribe = metadata;
      if (_.isNil(metadata.suffix)) {
        if (metadata.xmlName === "AuraDefinitionBundle") {
          metadata.suffix = "cmp";
          metadataDescribe.suffix = "cmp";
        } else if (metadata.xmlName == "LightningComponentBundle") {
          metadata.suffix = "js";
          metadataDescribe.suffix = "js";
        }
      }
      metadataDescribe.sourceExtension = `.${metadata.suffix}-meta.xml`;
      if (metadata.inFolder) {
        let folderExtensionPrefix = metadata.suffix;
        if (_.isNil(metadata.suffix)) {
          folderExtensionPrefix =
            metadata.xmlName.charAt(0).toLowerCase + metadata.xmlName.slice(1);
        }
        metadataDescribe.folderExtension = `.${folderExtensionPrefix}Folder-meta.xml`;
      }
      //Generate Describe of cheildItems if exists
      if (!_.isNil(metadata.childXmlNames)) {
        metadata.childXmlNames.forEach((element) => {
          let splitedElement = SPLITED_TYPES[element];
          if (!_.isNil(splitedElement)) {
            let childDescribe = {};
            childDescribe.directoryName = SPLITED_TYPES[element].folder;
            childDescribe.suffix = SPLITED_TYPES[element].suffix;
            childDescribe.xmlName = element;
            childDescribe.inFolder = false;
            childDescribe.metaFile = false;
            childDescribe.isChildComponent = true;
            childDescribe.sourceExtension = `.${SPLITED_TYPES[element].suffix}-meta.xml`;
            metadataInfo[childDescribe.xmlName] = childDescribe;
          }
        });
      }
      metadataInfo[metadataDescribe.xmlName] = metadataDescribe;
    });
    return metadataInfo;
  }
  static getMetadataName(metadataFile, validateSourceExtension = true) {
    let matcher = metadataFile.match(exports.SOURCE_EXTENSION_REGEX);
    let extension = "";
    if (matcher) {
      extension = matcher[0];
    } else {
      extension = path.parse(metadataFile).ext;
    }
    //SfPowerKit.ux.log(extension);
    let metadataName = "";
    const auraRegExp = new RegExp("aura");
    const lwcRegExp = new RegExp("lwc");
    const staticResourceRegExp = new RegExp("staticresources");
    const experienceBundleRegExp = new RegExp("experiences");
    const documentRegExp = new RegExp("documents");
    if (
      auraRegExp.test(metadataFile) &&
      (exports.SOURCE_EXTENSION_REGEX.test(metadataFile) ||
        !validateSourceExtension)
    ) {
      metadataName = exports.METADATA_INFO.AuraDefinitionBundle.xmlName;
    } else if (
      lwcRegExp.test(metadataFile) &&
      (exports.SOURCE_EXTENSION_REGEX.test(metadataFile) ||
        !validateSourceExtension)
    ) {
      metadataName = exports.METADATA_INFO.LightningComponentBundle.xmlName;
    } else if (
      staticResourceRegExp.test(metadataFile) &&
      (exports.SOURCE_EXTENSION_REGEX.test(metadataFile) ||
        !validateSourceExtension)
    ) {
      metadataName = exports.METADATA_INFO.StaticResource.xmlName;
    } else if (
      experienceBundleRegExp.test(metadataFile) &&
      (exports.SOURCE_EXTENSION_REGEX.test(metadataFile) ||
        !validateSourceExtension)
    ) {
      metadataName = exports.METADATA_INFO.ExperienceBundle.xmlName;
    } else if (
      documentRegExp.test(metadataFile) &&
      (exports.SOURCE_EXTENSION_REGEX.test(metadataFile) ||
        !validateSourceExtension)
    ) {
      metadataName = exports.METADATA_INFO.Document.xmlName;
    } else {
      let keys = Object.keys(exports.METADATA_INFO);
      for (let i = 0; i < keys.length; i++) {
        let metaDescribe = exports.METADATA_INFO[keys[i]];
        if (
          metaDescribe.sourceExtension === extension ||
          ("." + metaDescribe.suffix === extension &&
            !validateSourceExtension) ||
          metaDescribe.folderExtension === extension
        ) {
          metadataName = metaDescribe.xmlName;
          break;
        }
      }
    }
    return metadataName;
  }
}
exports.MetadataInfo = MetadataInfo;
exports.METADATA_INFO = MetadataInfo.loadMetadataInfo();
exports.UNSPLITED_METADATA = [
  exports.METADATA_INFO.Workflow,
  exports.METADATA_INFO.SharingRules,
  exports.METADATA_INFO.CustomLabels,
  exports.METADATA_INFO.Profile,
  exports.METADATA_INFO.PermissionSet,
];
exports.PROFILE_PERMISSIONSET_EXTENSION = [
  exports.METADATA_INFO.Profile,
  exports.METADATA_INFO.PermissionSet,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFJbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvbWV0YWRhdGFJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQ0FBNEI7QUFDNUIsMkNBQTZCO0FBQzdCLDZDQUErQjtBQUVsQixRQUFBLHNCQUFzQixHQUFHLHVCQUF1QixDQUFDO0FBQzlELE1BQU0sYUFBYSxHQUFHO0lBQ3BCLFdBQVcsRUFBRTtRQUNYLE1BQU0sRUFBRSxPQUFPO1FBQ2YsTUFBTSxFQUFFLFFBQVE7S0FDakI7SUFDRCxlQUFlLEVBQUU7UUFDZixNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLE1BQU0sRUFBRSxtQkFBbUI7S0FDNUI7SUFDRCxhQUFhLEVBQUU7UUFDYixNQUFNLEVBQUUsZUFBZTtRQUN2QixNQUFNLEVBQUUsZ0JBQWdCO0tBQ3pCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLFdBQVc7S0FDcEI7SUFDRCxVQUFVLEVBQUU7UUFDVixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsYUFBYTtLQUN0QjtJQUNELFFBQVEsRUFBRTtRQUNSLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLE1BQU0sRUFBRSxXQUFXO0tBQ3BCO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLGdCQUFnQjtLQUN6QjtJQUNELGNBQWMsRUFBRTtRQUNkLE1BQU0sRUFBRSxnQkFBZ0I7UUFDeEIsTUFBTSxFQUFFLGlCQUFpQjtLQUMxQjtJQUNELE9BQU8sRUFBRTtRQUNQLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxVQUFVO0tBQ25CO0NBQ0YsQ0FBQztBQXlERixNQUFhLFlBQVk7SUFDdkIsTUFBTSxDQUFDLGdCQUFnQjtRQUNyQixJQUFJLFlBQVksR0FBaUIsRUFBRSxDQUFD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
