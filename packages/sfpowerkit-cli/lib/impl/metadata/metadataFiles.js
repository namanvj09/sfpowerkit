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
const path = __importStar(require("path"));
const metadataInfo_1 = require("./metadataInfo");
const fileutils_1 = __importDefault(require("../../utils/fileutils"));
const _ = __importStar(require("lodash"));
const ignore_1 = __importDefault(require("ignore"));
const fs = __importStar(require("fs-extra"));
const glob = __importStar(require("glob"));
const sfpowerkit_1 = require("../../sfpowerkit");
const core_1 = require("@salesforce/core");
const SEP = /\/|\\/;
class MetadataFiles {
  constructor() {
    if (fs.existsSync(".forceignore")) {
      this.forceignore = ignore_1
        .default()
        .add(fs.readFileSync(".forceignore", "utf8").toString());
    } else {
      this.forceignore = ignore_1.default();
    }
  }
  static getFullApiName(fileName) {
    let fullName = "";
    let metadateType = metadataInfo_1.MetadataInfo.getMetadataName(fileName);
    let splitFilepath = fileName.split(SEP);
    let isObjectChild = metadataInfo_1.METADATA_INFO.CustomObject.childXmlNames.includes(
      metadateType
    );
    if (isObjectChild) {
      let objectName = splitFilepath[splitFilepath.length - 3];
      let fieldName = splitFilepath[splitFilepath.length - 1].split(".")[0];
      fullName = objectName.concat("." + fieldName);
    } else {
      fullName = splitFilepath[splitFilepath.length - 1].split(".")[0];
    }
    return fullName;
  }
  static getFullApiNameWithExtension(fileName) {
    let fullName = "";
    let metadateType = metadataInfo_1.MetadataInfo.getMetadataName(fileName);
    let splitFilepath = fileName.split(SEP);
    let isObjectChild = metadataInfo_1.METADATA_INFO.CustomObject.childXmlNames.includes(
      metadateType
    );
    if (isObjectChild) {
      let objectName = splitFilepath[splitFilepath.length - 3];
      let fieldName = splitFilepath[splitFilepath.length - 1];
      fullName = objectName.concat("." + fieldName);
    } else {
      fullName = splitFilepath[splitFilepath.length - 1];
    }
    return fullName;
  }
  static isCustomMetadata(filepath, name) {
    let result = true;
    let splitFilepath = filepath.split(SEP);
    let componentName = splitFilepath[splitFilepath.length - 1];
    componentName = componentName.substring(0, componentName.indexOf("."));
    if (
      name === metadataInfo_1.METADATA_INFO.CustomField.xmlName ||
      name === metadataInfo_1.METADATA_INFO.CustomObject.xmlName
    ) {
      //Custom Field or Custom Object
      result = componentName.endsWith("__c") || componentName.endsWith("__mdt");
    }
    return result;
  }
  static getMemberNameFromFilepath(filepath, name) {
    let member;
    let splitFilepath = filepath.split(SEP);
    let lastIndex = splitFilepath.length - 1;
    let isObjectChild = metadataInfo_1.METADATA_INFO.CustomObject.childXmlNames.includes(
      name
    );
    let metadataDescribe = metadataInfo_1.METADATA_INFO[name];
    if (isObjectChild) {
      let objectName = splitFilepath[lastIndex - 2];
      let fieldName = splitFilepath[lastIndex].split(".")[0];
      member = objectName.concat("." + fieldName);
    } else if (metadataDescribe.inFolder) {
      let baseName = metadataDescribe.directoryName;
      let baseIndex = filepath.indexOf(baseName) + baseName.length;
      let cmpPath = filepath.substring(baseIndex + 1); // add 1 to remove the path seperator
      cmpPath = cmpPath.substring(0, cmpPath.indexOf("."));
      member = cmpPath.replace(SEP, "/");
    } else {
      if (
        metadataInfo_1.SOURCE_EXTENSION_REGEX.test(splitFilepath[lastIndex])
      ) {
        member = splitFilepath[lastIndex].replace(
          metadataInfo_1.SOURCE_EXTENSION_REGEX,
          ""
        );
      } else {
        const auraRegExp = new RegExp("aura");
        const lwcRegExp = new RegExp("lwc");
        const staticResourceRegExp = new RegExp("staticresources");
        const experienceBundleRegExp = new RegExp("experiences");
        if (auraRegExp.test(filepath) || lwcRegExp.test(filepath)) {
          member = splitFilepath[lastIndex - 1];
        } else if (staticResourceRegExp.test(filepath)) {
          //Return the fileName
          let baseName = "staticresources";
          let baseIndex = filepath.indexOf(baseName) + baseName.length;
          let cmpPath = filepath.substring(baseIndex + 1); // add 1 to remove the path seperator
          member = cmpPath.split(SEP)[0];
          let extension = path.parse(member).ext;
          member = member.replace(new RegExp(extension + "$"), "");
        } else if (experienceBundleRegExp.test(filepath)) {
          //Return the fileName
          let baseName = "experiences";
          let baseIndex = filepath.indexOf(baseName) + baseName.length;
          let cmpPath = filepath.substring(baseIndex + 1); // add 1 to remove the path seperator
          member = cmpPath.split(SEP)[0];
          let extension = path.parse(member).ext;
          member = member.replace(new RegExp(extension + "$"), "");
        } else {
          let extension = path.parse(splitFilepath[lastIndex]).ext;
          member = splitFilepath[lastIndex].replace(
            new RegExp(extension + "$"),
            ""
          );
        }
      }
    }
    return member;
  }
  loadComponents(srcFolder, checkIgnore = true) {
    var metadataFiles = fileutils_1.default.getAllFilesSync(srcFolder);
    let keys = Object.keys(metadataInfo_1.METADATA_INFO);
    if (Array.isArray(metadataFiles) && metadataFiles.length > 0) {
      metadataFiles.forEach((metadataFile) => {
        let found = false;
        for (let i = 0; i < keys.length; i++) {
          let match = false;
          if (
            metadataFile.endsWith(
              metadataInfo_1.METADATA_INFO[keys[i]].sourceExtension
            )
          ) {
            match = true;
          } else if (
            metadataInfo_1.METADATA_INFO[keys[i]].inFolder &&
            metadataFile.endsWith(
              metadataInfo_1.METADATA_INFO[keys[i]].folderExtension
            )
          ) {
            match = true;
          }
          if (match) {
            if (_.isNil(metadataInfo_1.METADATA_INFO[keys[i]].files)) {
              metadataInfo_1.METADATA_INFO[keys[i]].files = [];
              metadataInfo_1.METADATA_INFO[keys[i]].components = [];
            }
            if (!checkIgnore || (checkIgnore && this.accepts(metadataFile))) {
              metadataInfo_1.METADATA_INFO[keys[i]].files.push(metadataFile);
              let name = fileutils_1.default.getFileNameWithoutExtension(
                metadataFile,
                metadataInfo_1.METADATA_INFO[keys[i]].sourceExtension
              );
              if (metadataInfo_1.METADATA_INFO[keys[i]].isChildComponent) {
                let fileParts = metadataFile.split(SEP);
                let parentName = fileParts[fileParts.length - 3];
                name = parentName + "." + name;
              }
              metadataInfo_1.METADATA_INFO[keys[i]].components.push(name);
            }
            found = true;
            break;
          }
        }
        if (!found) {
          const auraRegExp = new RegExp("aura");
          if (
            auraRegExp.test(metadataFile) &&
            metadataInfo_1.SOURCE_EXTENSION_REGEX.test(metadataFile)
          ) {
            if (
              _.isNil(metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.files)
            ) {
              metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.files = [];
              metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.components = [];
            }
            if (!checkIgnore || (checkIgnore && this.accepts(metadataFile))) {
              metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.files.push(
                metadataFile
              );
              let name = fileutils_1.default.getFileNameWithoutExtension(
                metadataFile
              );
              metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.components.push(
                name
              );
            }
          }
        }
      });
    } else {
      keys.forEach((key) => {
        if (_.isNil(metadataInfo_1.METADATA_INFO[key].files)) {
          metadataInfo_1.METADATA_INFO[key].files = [];
          metadataInfo_1.METADATA_INFO[key].components = [];
        }
      });
    }
  }
  //Check if a component is accepted by forceignore.
  accepts(filePath) {
    return !this.forceignore.ignores(path.relative(process.cwd(), filePath));
  }
  isInModuleFolder(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      const packageDirectories = yield sfpowerkit_1.SFPowerkit.getProjectDirectories();
      if (!packageDirectories || packageDirectories.length == 0) {
        return false;
      }
      const moduleFolder = packageDirectories.find((packageFolder) => {
        let packageFolderNormalized = path.relative("", packageFolder);
        return filePath.startsWith(packageFolderNormalized);
      });
      return moduleFolder !== undefined;
    });
  }
  /**
   * Copy a file to an outpu directory. If the filePath is a Metadata file Path,
   * All the metadata requirement are also copied. For example MyApexClass.cls-meta.xml will also copy MyApexClass.cls.
   * Enforcing the .forceignore to ignire file ignored in the project.
   * @param filePath
   * @param outputFolder
   */
  static copyFile(filePath, outputFolder) {
    sfpowerkit_1.SFPowerkit.log(
      `Copying file ${filePath} from file system to ${outputFolder}`,
      core_1.LoggerLevel.DEBUG
    );
    const LWC_IGNORE_FILES = ["jsconfig.json", ".eslintrc.json"];
    const pairStatResources =
      metadataInfo_1.METADATA_INFO.StaticResource.directoryName;
    const pairStatResourcesRegExp = new RegExp(pairStatResources);
    const pairAuaraRegExp = new RegExp(
      metadataInfo_1.METADATA_INFO.AuraDefinitionBundle.directoryName
    );
    let copyOutputFolder = outputFolder;
    if (!fs.existsSync(filePath)) {
      return;
    }
    let exists = fs.existsSync(path.join(outputFolder, filePath));
    if (exists) {
      return;
    }
    if (filePath.startsWith(".")) {
      let parts = path.parse(filePath);
      if (parts.dir === "") {
        fs.copyFileSync(filePath, path.join(outputFolder, filePath));
        return;
      }
    }
    let fileName = path.parse(filePath).base;
    //exclude lwc ignored files
    if (LWC_IGNORE_FILES.includes(fileName)) {
      return;
    }
    let filePathParts = filePath.split(SEP);
    if (fs.existsSync(outputFolder) == false) {
      fs.mkdirSync(outputFolder);
    }
    // Create folder structure
    for (let i = 0; i < filePathParts.length - 1; i++) {
      let folder = filePathParts[i].replace('"', "");
      outputFolder = path.join(outputFolder, folder);
      if (fs.existsSync(outputFolder) == false) {
        fs.mkdirSync(outputFolder);
      }
    }
    // Copy all file with same base name
    let associatedFilePattern = "";
    if (metadataInfo_1.SOURCE_EXTENSION_REGEX.test(filePath)) {
      associatedFilePattern = filePath.replace(
        metadataInfo_1.SOURCE_EXTENSION_REGEX,
        ".*"
      );
    } else {
      let extension = path.parse(filePath).ext;
      associatedFilePattern = filePath.replace(extension, ".*");
    }
    let files = glob.sync(associatedFilePattern);
    for (let i = 0; i < files.length; i++) {
      if (fs.lstatSync(files[i]).isDirectory() == false) {
        let oneFilePath = path.join(".", files[i]);
        let oneFilePathParts = oneFilePath.split(SEP);
        fileName = oneFilePathParts[oneFilePathParts.length - 1];
        let outputPath = path.join(outputFolder, fileName);
        fs.copyFileSync(files[i], outputPath);
      }
    }
    // Hadle ObjectTranslations
    // If a file fieldTranslation is copied, make sure the ObjectTranslation File is also copied
    if (
      filePath.endsWith("Translation-meta.xml") &&
      filePath.indexOf("globalValueSet") < 0
    ) {
      let parentFolder = filePathParts[filePathParts.length - 2];
      let objectTranslation =
        parentFolder +
        metadataInfo_1.METADATA_INFO.CustomObjectTranslation.sourceExtension;
      let outputPath = path.join(outputFolder, objectTranslation);
      let sourceFile = filePath.replace(fileName, objectTranslation);
      if (fs.existsSync(sourceFile) == true) {
        fs.copyFileSync(sourceFile, outputPath);
      }
    }
    //FOR STATIC RESOURCES - WHERE THE CORRESPONDING DIRECTORY + THE ROOT META FILE HAS TO BE INCLUDED
    if (pairStatResourcesRegExp.test(filePath)) {
      outputFolder = path.join(".", copyOutputFolder);
      let srcFolder = ".";
      let staticRecourceRoot = "";
      let resourceFile = "";
      for (let i = 0; i < filePathParts.length; i++) {
        outputFolder = path.join(outputFolder, filePathParts[i]);
        srcFolder = path.join(srcFolder, filePathParts[i]);
        if (
          filePathParts[i] ===
          metadataInfo_1.METADATA_INFO.StaticResource.directoryName
        ) {
          let fileOrDirname = filePathParts[i + 1];
          let fileOrDirnameParts = fileOrDirname.split(".");
          srcFolder = path.join(srcFolder, fileOrDirnameParts[0]);
          outputFolder = path.join(outputFolder, fileOrDirnameParts[0]);
          resourceFile =
            srcFolder +
            metadataInfo_1.METADATA_INFO.StaticResource.sourceExtension;
          metadataInfo_1.METADATA_INFO.StaticResource.sourceExtension;
          staticRecourceRoot =
            outputFolder +
            metadataInfo_1.METADATA_INFO.StaticResource.sourceExtension;
          if (fs.existsSync(srcFolder)) {
            if (fs.existsSync(outputFolder) == false) {
              fs.mkdirSync(outputFolder);
            }
          }
          break;
        }
      }
      if (fs.existsSync(srcFolder)) {
        fileutils_1.default.copyRecursiveSync(srcFolder, outputFolder);
      }
      if (fs.existsSync(resourceFile)) {
        fs.copyFileSync(resourceFile, staticRecourceRoot);
      }
    }
    //FOR AURA components and LWC components
    if (pairAuaraRegExp.test(filePath)) {
      outputFolder = path.join(".", copyOutputFolder);
      let srcFolder = ".";
      for (let i = 0; i < filePathParts.length; i++) {
        outputFolder = path.join(outputFolder, filePathParts[i]);
        srcFolder = path.join(srcFolder, filePathParts[i]);
        if (filePathParts[i] === "aura" || filePathParts[i] === "lwc") {
          let fileOrDirname = filePathParts[i + 1];
          let fileOrDirnameParts = fileOrDirname.split(".");
          srcFolder = path.join(srcFolder, fileOrDirnameParts[0]);
          outputFolder = path.join(outputFolder, fileOrDirnameParts[0]);
          if (fs.existsSync(srcFolder)) {
            if (fs.existsSync(outputFolder) == false) {
              fs.mkdirSync(outputFolder);
            }
          }
          break;
        }
      }
      if (fs.existsSync(srcFolder)) {
        fileutils_1.default.copyRecursiveSync(srcFolder, outputFolder);
      }
    }
  }
}
exports.default = MetadataFiles;
MetadataFiles.sourceOnly = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFGaWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL21ldGFkYXRhRmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZCO0FBQzdCLGlEQUt3QjtBQUN4QixzRUFBOEM7QUFDOUMsMENBQTRCO0FBQzVCLG9EQUE0QjtBQUM1Qiw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLGlEQUE4QztBQUM5QywyQ0FBK0M7QUFFL0MsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDO0FBRXBCLE1BQXFCLGFBQWE7SUFHaEM7UUFDRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxnQkFBTSxFQUFFLENBQUMsR0FBRyxDQUM3QixFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDbkQsQ0FBQztTQUNIO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxHQUFHLGdCQUFNLEVBQUUsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQWdCO1FBQ3BDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRCxJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLElBQUksYUFBYSxHQUFHLDRCQUFhLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ25FLFlBQVksQ0FDYixDQUFDO1FBQ0YsSUFBSSxhQUFhLEVBQUU7WUFDakIsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxD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
