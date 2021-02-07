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
const fs = __importStar(require("fs-extra"));
const _ = __importStar(require("lodash"));
const metadataFiles_1 = __importDefault(
  require("../../../impl/metadata/metadataFiles")
);
const metadataInfo_1 = require("../../../impl/metadata/metadataInfo");
const metadataInfo_2 = require("../../../impl/metadata/metadataInfo");
const sfpowerkit_1 = require("../../../sfpowerkit");
const core_1 = require("@salesforce/core");
const simple_git_1 = __importDefault(require("simple-git"));
const SEP = /\/|\\/;
const git = simple_git_1.default();
class DiffUtil {
  static isFormulaField(diffFile) {
    return __awaiter(this, void 0, void 0, function* () {
      let content = yield git.show(["--raw", diffFile.revisionFrom]);
      let result = content.includes("<formula>");
      return result;
    });
  }
  static fetchFileListRevisionTo(revisionTo) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Fetching file list from target revision " + revisionTo,
        core_1.LoggerLevel.INFO
      );
      DiffUtil.gitTreeRevisionTo = [];
      let revisionTree = yield git.raw(["ls-tree", "-r", revisionTo]);
      const sepRegex = /\n|\r/;
      let lines = revisionTree.split(sepRegex);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "") continue;
        let fields = lines[i].split(/\t/);
        let pathStr = fields[1];
        let revisionSha = fields[0].split(/\s/)[2];
        let oneFIle = {
          revision: revisionSha,
          path: path.join(".", pathStr),
        };
        DiffUtil.gitTreeRevisionTo.push(oneFIle);
      }
      return DiffUtil.gitTreeRevisionTo;
    });
  }
  static getRelativeFiles(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let relativeFiles = [];
      let filePathParts = filePath.split(SEP);
      const statResourcesRegExp = new RegExp(
        metadataInfo_2.METADATA_INFO.StaticResource.directoryName
      );
      const experienceBundleRegExp = new RegExp(
        metadataInfo_2.METADATA_INFO.ExperienceBundle.directoryName
      );
      const auraRegExp = new RegExp(
        metadataInfo_2.METADATA_INFO.AuraDefinitionBundle.directoryName
      );
      const lwcRegExp = new RegExp(
        metadataInfo_2.METADATA_INFO.LightningComponentBundle.directoryName
      );
      if (
        filePath.endsWith("Translation-meta.xml") &&
        filePath.indexOf("globalValueSet") < 0
      ) {
        let parentFolder = filePathParts[filePathParts.length - 2];
        let objectTranslation =
          parentFolder +
          metadataInfo_2.METADATA_INFO.CustomObjectTranslation.sourceExtension;
        DiffUtil.gitTreeRevisionTo.forEach((file) => {
          //copy objectTranslation if fieldTranslation changes
          if (file.path === filePath || file.path.endsWith(objectTranslation)) {
            relativeFiles.push(file);
          }
        });
      } else if (
        statResourcesRegExp.test(filePath) ||
        experienceBundleRegExp.test(filePath) ||
        auraRegExp.test(filePath) ||
        lwcRegExp.test(filePath)
      ) {
        // handle static recources
        let baseFile = "";
        for (let i = 0; i < filePathParts.length; i++) {
          baseFile = path.join(baseFile, filePathParts[i]);
          if (
            filePathParts[i] ===
              metadataInfo_2.METADATA_INFO.StaticResource.directoryName ||
            filePathParts[i] ===
              metadataInfo_2.METADATA_INFO.ExperienceBundle.directoryName ||
            filePathParts[i] ===
              metadataInfo_2.METADATA_INFO.AuraDefinitionBundle.directoryName ||
            filePathParts[i] ===
              metadataInfo_2.METADATA_INFO.LightningComponentBundle
                .directoryName
          ) {
            let fileOrDirname = filePathParts[i + 1];
            if (metadataInfo_1.SOURCE_EXTENSION_REGEX.test(fileOrDirname)) {
              fileOrDirname = fileOrDirname.replace(
                metadataInfo_1.SOURCE_EXTENSION_REGEX,
                ""
              );
            } else {
              let extension = path.parse(fileOrDirname).ext;
              fileOrDirname = fileOrDirname.replace(extension, "");
            }
            baseFile = path.join(baseFile, fileOrDirname);
            break;
          }
        }
        DiffUtil.gitTreeRevisionTo.forEach((file) => {
          let fileToCompare = file.path;
          if (fileToCompare.startsWith(baseFile)) {
            relativeFiles.push(file);
          }
        });
      } else {
        let baseFile = filePath;
        if (metadataInfo_1.SOURCE_EXTENSION_REGEX.test(filePath)) {
          baseFile = filePath.replace(
            metadataInfo_1.SOURCE_EXTENSION_REGEX,
            ""
          );
        } else {
          let extension = path.parse(filePath).ext;
          baseFile = filePath.replace(extension, "");
        }
        DiffUtil.gitTreeRevisionTo.forEach((file) => {
          let fileToCompare = file.path;
          if (metadataInfo_1.SOURCE_EXTENSION_REGEX.test(fileToCompare)) {
            fileToCompare = fileToCompare.replace(
              metadataInfo_1.SOURCE_EXTENSION_REGEX,
              ""
            );
          } else {
            let extension = path.parse(fileToCompare).ext;
            fileToCompare = fileToCompare.replace(extension, "");
          }
          if (baseFile === fileToCompare) {
            relativeFiles.push(file);
          }
        });
      }
      return relativeFiles;
    });
  }
  static copyFile(filePath, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        `Copying file ${filePath} from git to ${outputFolder}`,
        core_1.LoggerLevel.INFO
      );
      if (fs.existsSync(path.join(outputFolder, filePath))) {
        sfpowerkit_1.SFPowerkit.log(
          `File ${filePath}  already in output folder. `,
          core_1.LoggerLevel.TRACE
        );
        return;
      }
      let gitFiles = yield DiffUtil.getRelativeFiles(filePath);
      let copyOutputFolder = outputFolder;
      for (let i = 0; i < gitFiles.length; i++) {
        outputFolder = copyOutputFolder;
        let gitFile = gitFiles[i];
        sfpowerkit_1.SFPowerkit.log(
          `Associated file ${i}: ${gitFile.path}  Revision: ${gitFile.revision}`,
          core_1.LoggerLevel.TRACE
        );
        let outputPath = path.join(outputFolder, gitFile.path);
        let filePathParts = gitFile.path.split(SEP);
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
        let fileContent = yield git.binaryCatFile(["-p", gitFile.revision]);
        fs.writeFileSync(outputPath, fileContent);
      }
    });
  }
  static parseContent(fileContents) {
    return __awaiter(this, void 0, void 0, function* () {
      const statusRegEx = /\sA\t|\sM\t|\sD\t/;
      const renamedRegEx = /\sR[0-9]{3}\t|\sC[0-9]{3}\t/;
      const tabRegEx = /\t/;
      const deletedFileRegEx = new RegExp(/\sD\t/);
      const lineBreakRegEx = /\r?\n|\r|( $)/;
      let metadataFiles = new metadataFiles_1.default();
      var diffFile = {
        deleted: [],
        addedEdited: [],
      };
      for (var i = 0; i < fileContents.length; i++) {
        if (statusRegEx.test(fileContents[i])) {
          let lineParts = fileContents[i].split(statusRegEx);
          let finalPath = path.join(
            ".",
            lineParts[1].replace(lineBreakRegEx, "")
          );
          finalPath = finalPath.trim();
          finalPath = finalPath.replace("\\303\\251", "é");
          if (!(yield metadataFiles.isInModuleFolder(finalPath))) {
            continue;
          }
          if (!metadataFiles.accepts(finalPath)) {
            continue;
          }
          let revisionPart = lineParts[0].split(/\t|\s/);
          if (deletedFileRegEx.test(fileContents[i])) {
            //Deleted
            diffFile.deleted.push({
              revisionFrom: revisionPart[2].substring(0, 9),
              revisionTo: revisionPart[3].substring(0, 9),
              path: finalPath,
            });
          } else {
            // Added or edited
            diffFile.addedEdited.push({
              revisionFrom: revisionPart[2].substring(0, 9),
              revisionTo: revisionPart[3].substring(0, 9),
              path: finalPath,
            });
          }
        } else if (renamedRegEx.test(fileContents[i])) {
          let lineParts = fileContents[i].split(renamedRegEx);
          let paths = lineParts[1].trim().split(tabRegEx);
          let finalPath = path.join(".", paths[1].trim());
          finalPath = finalPath.replace("\\303\\251", "é");
          let revisionPart = lineParts[0].split(/\t|\s/);
          if (!(yield metadataFiles.isInModuleFolder(finalPath))) {
            continue;
          }
          if (!metadataFiles.accepts(paths[0].trim())) {
            continue;
          }
          diffFile.addedEdited.push({
            revisionFrom: "0000000",
            revisionTo: revisionPart[3],
            renamedPath: path.join(".", paths[0].trim()),
            path: finalPath,
          });
          //allow deletion of renamed components
          diffFile.deleted.push({
            revisionFrom: revisionPart[2],
            revisionTo: "0000000",
            path: paths[0].trim(),
          });
        }
      }
      return diffFile;
    });
  }
  static getChangedOrAdded(list1, list2, key) {
    let result = {
      addedEdited: [],
      deleted: [],
    };
    //Ensure array
    if (!_.isNil(list1) && !Array.isArray(list1)) {
      list1 = [list1];
    }
    if (!_.isNil(list2) && !Array.isArray(list2)) {
      list2 = [list2];
    }
    if (_.isNil(list1) && !_.isNil(list2) && list2.length > 0) {
      result.addedEdited.push(...list2);
    }
    if (_.isNil(list2) && !_.isNil(list1) && list1.length > 0) {
      result.deleted.push(...list1);
    }
    if (!_.isNil(list1) && !_.isNil(list2)) {
      list1.forEach((elem1) => {
        let found = false;
        for (let i = 0; i < list2.length; i++) {
          let elem2 = list2[i];
          if (elem1[key] === elem2[key]) {
            //check if edited
            if (!_.isEqual(elem1, elem2)) {
              result.addedEdited.push(elem2);
            }
            found = true;
            break;
          }
        }
        if (!found) {
          result.deleted.push(elem1);
        }
      });
      //Check for added elements
      let addedElement = _.differenceWith(
        list2,
        list1,
        function (element1, element2) {
          return element1[key] === element2[key];
        }
      );
      if (!_.isNil(addedElement)) {
        result.addedEdited.push(...addedElement);
      }
    }
    return result;
  }
  static addMemberToPackage(packageObj, name, member) {
    let typeIsPresent = false;
    for (let i = 0; i < packageObj.length; i++) {
      if (packageObj[i].name === name) {
        typeIsPresent = true;
        if (!packageObj[i].members.includes(member)) {
          packageObj[i].members.push(member);
        }
        break;
      }
    }
    let typeNode;
    if (typeIsPresent === false) {
      typeNode = {
        name: name,
        members: [member],
      };
      packageObj.push(typeNode);
    }
    return packageObj;
  }
}
exports.default = DiffUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZlV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L2RpZmYvZGlmZlV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZCO0FBQzdCLDZDQUErQjtBQUMvQiwwQ0FBNEI7QUFFNUIseUZBQWlFO0FBQ2pFLHNFQUE2RTtBQUM3RSxzRUFBb0U7QUFDcEUsb0RBQWlEO0FBQ2pELDJDQUErQztBQUMvQyw0REFBa0Q7QUFDbEQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDO0FBY3BCLE1BQU0sR0FBRyxHQUFjLG9CQUFTLEVBQUUsQ0FBQztBQUVuQyxNQUFxQixRQUFRO0lBS3BCLE1BQU0sQ0FBTyxjQUFjLENBQ2hDLFFBQXdCOztZQUV4QixJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFFTSxNQUFNLENBQU8sdUJBQXVCLENBQUMsVUFBa0I7O1lBQzVELHVCQUFVLENBQUMsR0FBRyxDQUNaLDBDQUEwQyxHQUFHLFVBQVUsRUFDdkQsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFDRixRQUFRLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1lBQ2hDLElBQUksWUFBWSxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDekIsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFR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
