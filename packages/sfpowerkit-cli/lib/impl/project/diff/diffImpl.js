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
const metadataFiles_1 = __importDefault(
  require("../../metadata/metadataFiles")
);
const xml2js = __importStar(require("xml2js"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const rimraf = __importStar(require("rimraf"));
const metadataInfo_1 = require("../../metadata/metadataInfo");
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const _ = __importStar(require("lodash"));
const profileDiff_1 = __importDefault(require("./profileDiff"));
const permsetDiff_1 = __importDefault(require("./permsetDiff"));
const workflowDiff_1 = __importDefault(require("./workflowDiff"));
const sharingRuleDiff_1 = __importDefault(require("./sharingRuleDiff"));
const customLabelsDiff_1 = __importDefault(require("./customLabelsDiff"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
const command_1 = require("@salesforce/command");
const sfpowerkit_1 = require("../../../sfpowerkit");
const dxProjectManifestUtils_1 = require("../../../utils/dxProjectManifestUtils");
const promise_1 = __importDefault(require("simple-git/promise"));
command_1.core.Messages.importMessagesDirectory(__dirname);
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "project_diff"
);
const deleteNotSupported = ["RecordType"];
const git = promise_1.default();
const unsplitedMetadataExtensions = metadataInfo_1.UNSPLITED_METADATA.map(
  (elem) => {
    return elem.sourceExtension;
  }
);
const permissionExtensions = metadataInfo_1.PROFILE_PERMISSIONSET_EXTENSION.map(
  (elem) => {
    return elem.sourceExtension;
  }
);
const SEP = /\/|\\/;
class DiffImpl {
  constructor(revisionFrom, revisionTo, isDestructive, pathToIgnore) {
    this.revisionFrom = revisionFrom;
    this.revisionTo = revisionTo;
    this.isDestructive = isDestructive;
    this.pathToIgnore = pathToIgnore;
    if (this.revisionTo == null || this.revisionTo.trim() === "") {
      this.revisionTo = "HEAD";
    }
    if (this.revisionFrom == null) {
      this.revisionFrom = "";
    }
    this.destructivePackageObjPost = new Array();
    this.destructivePackageObjPre = new Array();
    this.resultOutput = [];
  }
  build(outputFolder, packagedirectories, apiversion) {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync(outputFolder);
      if (packagedirectories) {
        sfpowerkit_1.SFPowerkit.setProjectDirectories(packagedirectories);
      }
      if (apiversion) {
        sfpowerkit_1.SFPowerkit.setapiversion(apiversion);
      }
      //const sepRegex=/\t| |\n/;
      const sepRegex = /\n|\r/;
      let data = "";
      //check if same commit
      const commitFrom = yield git.raw([
        "rev-list",
        "-n",
        "1",
        this.revisionFrom,
      ]);
      const commitTo = yield git.raw(["rev-list", "-n", "1", this.revisionTo]);
      if (commitFrom === commitTo) {
        throw new Error(messages.getMessage("sameCommitErrorMessage"));
      }
      //Make it relative to make the command works from a project created as a subfolder in a repository
      data = yield git.diff([
        "--raw",
        this.revisionFrom,
        this.revisionTo,
        "--relative",
      ]);
      sfpowerkit_1.SFPowerkit.log(
        `Input Param: From: ${this.revisionFrom}  To: ${this.revisionTo} `,
        sfpowerkit_1.LoggerLevel.INFO
      );
      sfpowerkit_1.SFPowerkit.log(
        `SHA Found From: ${commitFrom} To:  ${commitTo} `,
        sfpowerkit_1.LoggerLevel.INFO
      );
      sfpowerkit_1.SFPowerkit.log(data, sfpowerkit_1.LoggerLevel.TRACE);
      let content = data.split(sepRegex);
      let diffFile = yield diffUtil_1.default.parseContent(content);
      yield diffUtil_1.default.fetchFileListRevisionTo(this.revisionTo);
      let filesToCopy = diffFile.addedEdited;
      let deletedFiles = diffFile.deleted;
      deletedFiles = deletedFiles.filter((deleted) => {
        let found = false;
        let deletedMetadata = metadataFiles_1.default.getFullApiNameWithExtension(
          deleted.path
        );
        for (let i = 0; i < filesToCopy.length; i++) {
          let addedOrEdited = metadataFiles_1.default.getFullApiNameWithExtension(
            filesToCopy[i].path
          );
          if (deletedMetadata === addedOrEdited) {
            found = true;
            break;
          }
        }
        return !found;
      });
      if (fs.existsSync(outputFolder) == false) {
        fs.mkdirSync(outputFolder);
      }
      sfpowerkit_1.SFPowerkit.log(
        "Files to be copied",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      sfpowerkit_1.SFPowerkit.log(filesToCopy, sfpowerkit_1.LoggerLevel.DEBUG);
      if (filesToCopy && filesToCopy.length > 0) {
        for (var i = 0; i < filesToCopy.length; i++) {
          let filePath = filesToCopy[i].path;
          try {
            if (DiffImpl.checkForIngore(this.pathToIgnore, filePath)) {
              let matcher = filePath.match(
                metadataInfo_1.SOURCE_EXTENSION_REGEX
              );
              let extension = "";
              if (matcher) {
                extension = matcher[0];
              } else {
                extension = path.parse(filePath).ext;
              }
              if (unsplitedMetadataExtensions.includes(extension)) {
                //handle unsplited files
                yield this.handleUnsplittedMetadata(
                  filesToCopy[i],
                  outputFolder
                );
              } else {
                yield diffUtil_1.default.copyFile(filePath, outputFolder);
                sfpowerkit_1.SFPowerkit.log(
                  `Copied file ${filePath} to ${outputFolder}`,
                  sfpowerkit_1.LoggerLevel.DEBUG
                );
              }
            }
          } catch (ex) {
            this.resultOutput.push({
              action: "ERROR",
              componentName: "",
              metadataType: "",
              message: ex.message,
              path: filePath,
            });
          }
        }
      }
      if (this.isDestructive) {
        sfpowerkit_1.SFPowerkit.log(
          "Creating Destructive Manifest..",
          sfpowerkit_1.LoggerLevel.INFO
        );
        yield this.createDestructiveChanges(deletedFiles, outputFolder);
      }
      sfpowerkit_1.SFPowerkit.log(
        `Generating output summary`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      this.buildOutput(outputFolder);
      if (this.resultOutput.length > 0) {
        try {
          yield diffUtil_1.default.copyFile(".forceignore", outputFolder);
        } catch (e) {
          sfpowerkit_1.SFPowerkit.log(
            `.forceignore not found, skipping..`,
            sfpowerkit_1.LoggerLevel.INFO
          );
        }
        try {
          //check if package path is provided
          if (packagedirectories) {
            let sourceApiVersion = yield sfpowerkit_1.SFPowerkit.getApiVersion();
            let packageDirectorieslist = [];
            packagedirectories.forEach((path) => {
              packageDirectorieslist.push({
                path: path,
              });
            });
            let sfdx_project = {
              packageDirectories: packageDirectorieslist,
              namespace: "",
              sourceApiVersion: sourceApiVersion,
            };
            fs.outputFileSync(
              `${outputFolder}/sfdx-project.json`,
              JSON.stringify(sfdx_project)
            );
          } else {
            //Copy project manifest
            yield diffUtil_1.default.copyFile(
              "sfdx-project.json",
              outputFolder
            );
          }
          //Remove Project Directories that doesnt  have any components in ths diff  Fix #178
          let dxProjectManifestUtils = new dxProjectManifestUtils_1.DXProjectManifestUtils(
            outputFolder
          );
          dxProjectManifestUtils.removePackagesNotInDirectory();
        } catch (e) {
          sfpowerkit_1.SFPowerkit.log(
            `sfdx-project.json not found, skipping..`,
            sfpowerkit_1.LoggerLevel.INFO
          );
        }
      }
      return this.resultOutput;
    });
  }
  static checkForIngore(pathToIgnore, filePath) {
    pathToIgnore = pathToIgnore || [];
    if (pathToIgnore.length === 0) {
      return true;
    }
    let returnVal = true;
    pathToIgnore.forEach((ignore) => {
      if (
        path.resolve(ignore) === path.resolve(filePath) ||
        path.resolve(filePath).includes(path.resolve(ignore))
      ) {
        returnVal = false;
      }
    });
    return returnVal;
  }
  buildOutput(outputFolder) {
    let metadataFiles = new metadataFiles_1.default();
    metadataFiles.loadComponents(outputFolder, false);
    let keys = Object.keys(metadataInfo_1.METADATA_INFO);
    let excludedFiles = _.difference(
      unsplitedMetadataExtensions,
      permissionExtensions
    );
    keys.forEach((key) => {
      if (
        metadataInfo_1.METADATA_INFO[key].files &&
        metadataInfo_1.METADATA_INFO[key].files.length > 0
      ) {
        metadataInfo_1.METADATA_INFO[key].files.forEach((filePath) => {
          let matcher = filePath.match(metadataInfo_1.SOURCE_EXTENSION_REGEX);
          let extension = "";
          if (matcher) {
            extension = matcher[0];
          } else {
            extension = path.parse(filePath).ext;
          }
          if (!excludedFiles.includes(extension)) {
            let name = fileutils_1.default.getFileNameWithoutExtension(
              filePath,
              metadataInfo_1.METADATA_INFO[key].sourceExtension
            );
            if (metadataInfo_1.METADATA_INFO[key].isChildComponent) {
              let fileParts = filePath.split(SEP);
              let parentName = fileParts[fileParts.length - 3];
              name = parentName + "." + name;
            }
            this.resultOutput.push({
              action: "Deploy",
              metadataType: metadataInfo_1.METADATA_INFO[key].xmlName,
              componentName: name,
              message: "",
              path: filePath,
            });
          }
        });
      }
    });
    return this.resultOutput;
  }
  handleUnsplittedMetadata(diffFile, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
      let content1 = "";
      let content2 = "";
      try {
        if (diffFile.revisionFrom !== "0000000") {
          content1 = yield git.show(["--raw", diffFile.revisionFrom]);
        }
      } catch (e) {}
      try {
        if (diffFile.revisionTo !== "0000000") {
          content2 = yield git.show(["--raw", diffFile.revisionTo]);
        }
      } catch (e) {}
      fileutils_1.default.mkDirByPathSync(
        path.join(outputFolder, path.parse(diffFile.path).dir)
      );
      if (
        diffFile.path.endsWith(
          metadataInfo_1.METADATA_INFO.Workflow.sourceExtension
        )
      ) {
        //Workflow
        let baseName = path.parse(diffFile.path).base;
        let objectName = baseName.split(".")[0];
        yield workflowDiff_1.default.generateWorkflowXml(
          content1,
          content2,
          path.join(outputFolder, diffFile.path),
          objectName,
          this.destructivePackageObjPost,
          this.resultOutput,
          this.isDestructive
        );
      }
      if (
        diffFile.path.endsWith(
          metadataInfo_1.METADATA_INFO.SharingRules.sourceExtension
        )
      ) {
        let baseName = path.parse(diffFile.path).base;
        let objectName = baseName.split(".")[0];
        yield sharingRuleDiff_1.default.generateSharingRulesXml(
          content1,
          content2,
          path.join(outputFolder, diffFile.path),
          objectName,
          this.destructivePackageObjPost,
          this.resultOutput,
          this.isDestructive
        );
      }
      if (
        diffFile.path.endsWith(
          metadataInfo_1.METADATA_INFO.CustomLabels.sourceExtension
        )
      ) {
        yield customLabelsDiff_1.default.generateCustomLabelsXml(
          content1,
          content2,
          path.join(outputFolder, diffFile.path),
          this.destructivePackageObjPost,
          this.resultOutput,
          this.isDestructive
        );
      }
      if (
        diffFile.path.endsWith(
          metadataInfo_1.METADATA_INFO.Profile.sourceExtension
        )
      ) {
        //Deploy only what changed
        if (content1 === "") {
          yield diffUtil_1.default.copyFile(diffFile.path, outputFolder);
          sfpowerkit_1.SFPowerkit.log(
            `Copied file ${diffFile.path} to ${outputFolder}`,
            sfpowerkit_1.LoggerLevel.DEBUG
          );
        } else if (content2 === "") {
          //The profile is deleted or marked as renamed.
          //Delete the renamed one
          let profileType = _.find(
            this.destructivePackageObjPost,
            function (metaType) {
              return (
                metaType.name === metadataInfo_1.METADATA_INFO.Profile.xmlName
              );
            }
          );
          if (profileType === undefined) {
            profileType = {
              name: metadataInfo_1.METADATA_INFO.Profile.xmlName,
              members: [],
            };
            this.destructivePackageObjPost.push(profileType);
          }
          let baseName = path.parse(diffFile.path).base;
          let profileName = baseName.split(".")[0];
          profileType.members.push(profileName);
        } else {
          yield profileDiff_1.default.generateProfileXml(
            content1,
            content2,
            path.join(outputFolder, diffFile.path)
          );
        }
      }
      if (
        diffFile.path.endsWith(
          metadataInfo_1.METADATA_INFO.PermissionSet.sourceExtension
        )
      ) {
        let sourceApiVersion = yield sfpowerkit_1.SFPowerkit.getApiVersion();
        if (content1 === "") {
          yield diffUtil_1.default.copyFile(diffFile.path, outputFolder);
          sfpowerkit_1.SFPowerkit.log(
            `Copied file ${diffFile.path} to ${outputFolder}`,
            sfpowerkit_1.LoggerLevel.DEBUG
          );
        } else if (sourceApiVersion <= 39.0) {
          // in API 39 and erliar PermissionSet deployment are merged. deploy only what changed
          if (content2 === "") {
            //Deleted permissionSet
            let permsetType = _.find(
              this.destructivePackageObjPost,
              function (metaType) {
                return (
                  metaType.name ===
                  metadataInfo_1.METADATA_INFO.PermissionSet.xmlName
                );
              }
            );
            if (permsetType === undefined) {
              permsetType = {
                name: metadataInfo_1.METADATA_INFO.PermissionSet.xmlName,
                members: [],
              };
              this.destructivePackageObjPost.push(permsetType);
            }
            let baseName = path.parse(diffFile.path).base;
            let permsetName = baseName.split(".")[0];
            permsetType.members.push(permsetName);
          } else {
            yield permsetDiff_1.default.generatePermissionsetXml(
              content1,
              content2,
              path.join(outputFolder, diffFile.path)
            );
          }
        } else {
          //PermissionSet deployment override in the target org
          //So deploy the whole file
          yield diffUtil_1.default.copyFile(diffFile.path, outputFolder);
          sfpowerkit_1.SFPowerkit.log(
            `Copied file ${diffFile.path} to ${outputFolder}`,
            sfpowerkit_1.LoggerLevel.DEBUG
          );
        }
      }
    });
  }
  createDestructiveChanges(filePaths, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
      if (_.isNil(this.destructivePackageObjPost)) {
        this.destructivePackageObjPost = new Array();
      } else {
        this.destructivePackageObjPost = this.destructivePackageObjPost.filter(
          (metaType) => {
            return !_.isNil(metaType.members) && metaType.members.length > 0;
          }
        );
      }
      this.destructivePackageObjPre = new Array();
      //returns root, dir, base and name
      for (let i = 0; i < filePaths.length; i++) {
        let filePath = filePaths[i].path;
        try {
          let matcher = filePath.match(metadataInfo_1.SOURCE_EXTENSION_REGEX);
          let extension = "";
          if (matcher) {
            extension = matcher[0];
          } else {
            extension = path.parse(filePath).ext;
          }
          if (unsplitedMetadataExtensions.includes(extension)) {
            //handle unsplited files
            yield this.handleUnsplittedMetadata(filePaths[i], outputFolder);
            continue;
          }
          let parsedPath = path.parse(filePath);
          let filename = parsedPath.base;
          let name = metadataInfo_1.MetadataInfo.getMetadataName(filePath);
          if (name) {
            if (!metadataFiles_1.default.isCustomMetadata(filePath, name)) {
              // avoid to generate destructive for Standard Components
              //Support on Custom Fields and Custom Objects for now
              this.resultOutput.push({
                action: "Skip",
                componentName: metadataFiles_1.default.getMemberNameFromFilepath(
                  filePath,
                  name
                ),
                metadataType: "StandardField/CustomMetadata",
                message: "",
                path: "--",
              });
              continue;
            }
            let member = metadataFiles_1.default.getMemberNameFromFilepath(
              filePath,
              name
            );
            if (name === metadataInfo_1.METADATA_INFO.CustomField.xmlName) {
              let isFormular = yield diffUtil_1.default.isFormulaField(
                filePaths[i]
              );
              if (isFormular) {
                this.destructivePackageObjPre = this.buildDestructiveTypeObj(
                  this.destructivePackageObjPre,
                  name,
                  member
                );
                sfpowerkit_1.SFPowerkit.log(
                  `${filePath} ${metadataFiles_1.default.isCustomMetadata(
                    filePath,
                    name
                  )}`,
                  sfpowerkit_1.LoggerLevel.DEBUG
                );
                this.resultOutput.push({
                  action: "Delete",
                  componentName: member,
                  metadataType: name,
                  message: "",
                  path: "Manual Intervention Required",
                });
              } else {
                this.destructivePackageObjPost = this.buildDestructiveTypeObj(
                  this.destructivePackageObjPost,
                  name,
                  member
                );
              }
              sfpowerkit_1.SFPowerkit.log(
                `${filePath} ${metadataFiles_1.default.isCustomMetadata(
                  filePath,
                  name
                )}`,
                sfpowerkit_1.LoggerLevel.DEBUG
              );
              this.resultOutput.push({
                action: "Delete",
                componentName: member,
                metadataType: name,
                message: "",
                path: "destructiveChanges.xml",
              });
            } else {
              if (!deleteNotSupported.includes(name)) {
                this.destructivePackageObjPost = this.buildDestructiveTypeObj(
                  this.destructivePackageObjPost,
                  name,
                  member
                );
                this.resultOutput.push({
                  action: "Delete",
                  componentName: member,
                  metadataType: name,
                  message: "",
                  path: "destructiveChanges.xml",
                });
              } else {
                //add the component in the manual action list
                // TODO
              }
            }
          }
        } catch (ex) {
          this.resultOutput.push({
            action: "ERROR",
            componentName: "",
            metadataType: "",
            message: ex.message,
            path: filePath,
          });
        }
      }
      // this.writeDestructivechanges(
      //   this.destructivePackageObjPre,
      //   outputFolder,
      //   "destructiveChangesPre.xml"
      // );
      this.writeDestructivechanges(
        this.destructivePackageObjPost,
        outputFolder,
        "destructiveChanges.xml"
      );
    });
  }
  writeDestructivechanges(destrucObj, outputFolder, fileName) {
    //ensure unique component per type
    for (let i = 0; i < destrucObj.length; i++) {
      destrucObj[i].members = _.uniq(destrucObj[i].members);
    }
    destrucObj = destrucObj.filter((metaType) => {
      return metaType.members && metaType.members.length > 0;
    });
    if (destrucObj.length > 0) {
      let dest = {
        Package: {
          $: {
            xmlns: "http://soap.sforce.com/2006/04/metadata",
          },
          types: destrucObj,
        },
      };
      let destructivePackageName = fileName;
      let filepath = path.join(outputFolder, destructivePackageName);
      let builder = new xml2js.Builder();
      let xml = builder.buildObject(dest);
      fs.writeFileSync(filepath, xml);
    }
  }
  buildDestructiveTypeObj(destructiveObj, name, member) {
    let typeIsPresent = false;
    for (let i = 0; i < destructiveObj.length; i++) {
      if (destructiveObj[i].name === name) {
        typeIsPresent = true;
        destructiveObj[i].members.push(member);
        break;
      }
    }
    let typeNode;
    if (typeIsPresent === false) {
      typeNode = {
        name: name,
        members: [member],
      };
      destructiveObj.push(typeNode);
    }
    return destructiveObj;
  }
}
exports.default = DiffImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L2RpZmYvZGlmZkltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUZBQXlEO0FBRXpELCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsNkNBQStCO0FBQy9CLCtDQUFpQztBQUNqQyw4REFNcUM7QUFDckMseUVBQWlEO0FBQ2pELDBDQUE0QjtBQUM1QixnRUFBd0M7QUFDeEMsZ0VBQXdDO0FBQ3hDLGtFQUEwQztBQUMxQyx3RUFBZ0Q7QUFDaEQsMEVBQWtEO0FBQ2xELDBEQUFnRTtBQUNoRSxpREFBMkM7QUFFM0Msb0RBQThEO0FBQzlELGtGQUErRTtBQUMvRSxpRUFBMkM7QUFFM0MsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRCxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFMUUsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRTFDLE1BQU0sR0FBRyxHQUFHLGlCQUFTLEVBQUUsQ0FBQztBQUV4QixNQUFNLDJCQUEyQixHQUFHLGlDQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNoRSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUM7QUFDSCxNQUFNLG9CQUFvQixHQUFHLDhDQUErQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUN0RSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUM7QUFFcEIsTUFBcUIsUUFBUTtJQVUzQixZQUNVLFlBQXFCLEVBQ3JC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
