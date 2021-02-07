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
const metadataInfo_1 = require("../../../impl/metadata/metadataInfo");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const metadataFiles_1 = __importDefault(
  require("../../../impl/metadata/metadataFiles")
);
const diffUtil_1 = __importDefault(require("../diff/diffUtil"));
const checkRetrievalStatus_1 = require("../../../utils/checkRetrievalStatus");
const extract_1 = require("../../../utils/extract");
const rimraf = __importStar(require("rimraf"));
const customLabelsDiff_1 = __importDefault(require("../diff/customLabelsDiff"));
const sharingRuleDiff_1 = __importDefault(require("../diff/sharingRuleDiff"));
const workflowDiff_1 = __importDefault(require("../diff/workflowDiff"));
const GetNodeWrapper_1 = require("../../../sfdxnode/GetNodeWrapper");
const parallel_1 = require("../../../sfdxnode/parallel");
const jsdiff = require("diff");
const CRLF_REGEX = /\r\n/;
const LF_REGEX = /\n/;
const unsplitedMetadataExtensions = metadataInfo_1.UNSPLITED_METADATA.filter(
  (elem) => {
    return (
      elem.xmlName !== metadataInfo_1.METADATA_INFO.Profile.xmlName &&
      elem.xmlName !== metadataInfo_1.METADATA_INFO.PermissionSet.xmlName
    );
  }
).map((elem) => {
  return elem.sourceExtension;
});
class OrgDiffImpl {
  constructor(filesOrFolders, org, addConflictMarkers) {
    this.filesOrFolders = filesOrFolders;
    this.org = org;
    this.addConflictMarkers = addConflictMarkers;
    this.output = [];
  }
  orgDiff() {
    return __awaiter(this, void 0, void 0, function* () {
      let packageobj = new Array();
      sfpowerkit_1.SFPowerkit.setStatus(
        "Building package metadata for retrieve"
      );
      this.filesOrFolders.forEach((fileOrFolder) =>
        __awaiter(this, void 0, void 0, function* () {
          sfpowerkit_1.SFPowerkit.log(
            "Processing " + fileOrFolder,
            sfpowerkit_1.LoggerLevel.DEBUG
          );
          fileOrFolder = path.normalize(fileOrFolder);
          let pathExists = fs.existsSync(fileOrFolder);
          if (pathExists) {
            let stats = fs.statSync(fileOrFolder);
            if (stats.isFile()) {
              //Process File
              packageobj = yield this.buildPackageObj(fileOrFolder, packageobj);
            } else if (stats.isDirectory()) {
              //Process File
              let files = fileutils_1.default.getAllFilesSync(fileOrFolder);
              files.forEach((oneFile) =>
                __awaiter(this, void 0, void 0, function* () {
                  packageobj = yield this.buildPackageObj(oneFile, packageobj);
                })
              );
            }
          } else {
            sfpowerkit_1.SFPowerkit.log(
              `Path ${fileOrFolder} does not exists. `,
              sfpowerkit_1.LoggerLevel.ERROR
            );
          }
        })
      );
      if (!packageobj || packageobj.length < 1) {
        throw new Error("you must pass atleast one valid path.");
      }
      sfpowerkit_1.SFPowerkit.setStatus("Retrieving metadata");
      yield this.retrievePackage(packageobj);
      sfpowerkit_1.SFPowerkit.setStatus("Comparing files");
      this.compare();
      rimraf.sync("temp_sfpowerkit");
      return this.output;
    });
  }
  buildPackageObj(filePath, packageobj) {
    return __awaiter(this, void 0, void 0, function* () {
      let matcher = filePath.match(metadataInfo_1.SOURCE_EXTENSION_REGEX);
      let extension = "";
      if (matcher) {
        extension = matcher[0];
      } else {
        extension = path.parse(filePath).ext;
      }
      try {
        if (unsplitedMetadataExtensions.includes(extension)) {
          //handle unsplited metadata
          yield this.handleUnsplitedMetadatas(filePath, packageobj);
        } else {
          let name = metadataInfo_1.MetadataInfo.getMetadataName(
            filePath,
            false
          );
          let member = metadataFiles_1.default.getMemberNameFromFilepath(
            filePath,
            name
          );
          packageobj = diffUtil_1.default.addMemberToPackage(
            packageobj,
            name,
            member
          );
        }
      } catch (err) {
        throw new Error(err + ",Error file path : " + filePath);
      }
      return packageobj;
    });
  }
  handleUnsplitedMetadatas(filePath, packageobj) {
    return __awaiter(this, void 0, void 0, function* () {
      if (
        filePath.endsWith(
          metadataInfo_1.METADATA_INFO.CustomLabels.sourceExtension
        )
      ) {
        let members = yield customLabelsDiff_1.default.getMembers(filePath);
        packageobj.push({
          name: "CustomLabel",
          members: members,
        });
      }
      if (
        filePath.endsWith(
          metadataInfo_1.METADATA_INFO.SharingRules.sourceExtension
        )
      ) {
        let name = metadataInfo_1.MetadataInfo.getMetadataName(filePath, false);
        let objectName = metadataFiles_1.default.getMemberNameFromFilepath(
          filePath,
          name
        );
        let members = yield sharingRuleDiff_1.default.getMembers(filePath);
        Object.keys(members).forEach((key) => {
          packageobj.push({
            name: key,
            members: members[key].map((elem) => {
              return objectName + "." + elem;
            }),
          });
        });
      }
      if (
        filePath.endsWith(metadataInfo_1.METADATA_INFO.Workflow.sourceExtension)
      ) {
        let name = metadataInfo_1.MetadataInfo.getMetadataName(filePath, false);
        let objectName = metadataFiles_1.default.getMemberNameFromFilepath(
          filePath,
          name
        );
        let members = yield workflowDiff_1.default.getMembers(filePath);
        Object.keys(members).forEach((key) => {
          packageobj.push({
            name: key,
            members: members[key].map((elem) => {
              return objectName + "." + elem;
            }),
          });
        });
      }
    });
  }
  compare() {
    // let fetchedFiles = FileUtils.getAllFilesSync(`./temp_sfpowerkit/mdapi`, "");
    let fetchedFiles = fileutils_1.default.getAllFilesSync(
      `./temp_sfpowerkit/source`,
      ""
    );
    this.filesOrFolders.forEach((fileOrFolder) => {
      fileOrFolder = path.normalize(fileOrFolder);
      let pathExists = fs.existsSync(fileOrFolder);
      if (pathExists) {
        let stats = fs.statSync(fileOrFolder);
        if (stats.isFile()) {
          //Process File
          this.processFile(fileOrFolder, fetchedFiles);
        } else if (stats.isDirectory()) {
          //Read files in directory
          let files = fileutils_1.default.getAllFilesSync(fileOrFolder, "");
          files.forEach((oneFile) => {
            //process file
            this.processFile(oneFile, fetchedFiles);
          });
        }
      }
    });
  }
  processFile(localFile, fetchedFiles) {
    sfpowerkit_1.SFPowerkit.log(
      "Compare:  Processing " + localFile,
      sfpowerkit_1.LoggerLevel.DEBUG
    );
    let metaType = metadataInfo_1.MetadataInfo.getMetadataName(
      localFile,
      false
    );
    let member = metadataFiles_1.default.getMemberNameFromFilepath(
      localFile,
      metaType
    );
    // let extension = path.parse(localFile).ext;
    let cmpPath = path.parse(localFile).base;
    let metadataDescribe = metadataInfo_1.METADATA_INFO[metaType];
    const staticResourceRegExp = new RegExp("staticresources");
    if (metadataDescribe.inFolder || staticResourceRegExp.test(localFile)) {
      let folderName = "staticresources";
      if (metadataDescribe.inFolder) {
        folderName = metadataDescribe.directoryName;
      }
      let baseIndex = localFile.indexOf(folderName) + folderName.length;
      cmpPath = localFile.substring(baseIndex + 1);
    }
    // find the files
    let foundFile = fetchedFiles.find((fetchFile) => {
      let fetchedMetaType = metadataInfo_1.MetadataInfo.getMetadataName(
        fetchFile,
        false
      );
      let fetchedMember = metadataFiles_1.default.getMemberNameFromFilepath(
        fetchFile,
        fetchedMetaType
      );
      //let fetchedExtension = path.parse(fetchFile).ext;
      let fetchedCmpPath = path.parse(fetchFile).base;
      let fetchedMetadataDescribe =
        metadataInfo_1.METADATA_INFO[fetchedMetaType];
      if (
        fetchedMetadataDescribe.inFolder ||
        staticResourceRegExp.test(fetchFile)
      ) {
        let fetchedFolderName = "staticresources";
        if (fetchedMetadataDescribe.inFolder) {
          fetchedFolderName = fetchedMetadataDescribe.directoryName;
        }
        let fetchedBaseIndex =
          fetchFile.indexOf(fetchedFolderName) + fetchedFolderName.length;
        fetchedCmpPath = fetchFile.substring(fetchedBaseIndex + 1);
      }
      return (
        fetchedMetaType === metaType &&
        member === fetchedMember &&
        cmpPath === fetchedCmpPath
      );
    });
    if (foundFile !== undefined) {
      let contentLocalFile = fs.readFileSync(localFile, "utf8");
      let contentFetchedFile = fs.readFileSync(foundFile, "utf8");
      //Normalise line ending on windows
      let matcherLocal = contentLocalFile.match(CRLF_REGEX);
      let matcherFetched = contentFetchedFile.match(CRLF_REGEX);
      let lineEnd = "\n";
      if (matcherLocal && !matcherFetched) {
        lineEnd = matcherLocal[0];
        contentFetchedFile = contentFetchedFile.split(LF_REGEX).join(lineEnd);
      }
      if (
        !contentLocalFile.endsWith(lineEnd) &&
        contentFetchedFile.endsWith(lineEnd)
      ) {
        contentFetchedFile = contentFetchedFile.substr(
          0,
          contentFetchedFile.lastIndexOf(lineEnd)
        );
      }
      if (
        contentLocalFile.endsWith(lineEnd) &&
        !contentFetchedFile.endsWith(lineEnd)
      ) {
        contentFetchedFile = contentFetchedFile + lineEnd;
      }
      let diffResult = jsdiff.diffLines(contentLocalFile, contentFetchedFile);
      //Process the diff result add add conflict marker on the files
      this.processResult(localFile, diffResult);
    } else {
      this.output.push({
        status: "Local Added / Remote Deleted",
        metadataType: metaType,
        componentName: member,
        path: localFile,
      });
    }
  }
  processResult(filePath, diffResult) {
    let content = "";
    let firstChunkProcessed = false;
    let changedLocaly = false;
    let changedRemote = false;
    let conflict = false;
    for (let i = 0; i < diffResult.length; i++) {
      let result = diffResult[i];
      let index = i;
      let originalArray = diffResult;
      if (result.removed) {
        if (firstChunkProcessed) {
          content = content + `${result.value}>>>>>>> Remote:${filePath}\n`;
          firstChunkProcessed = false;
          conflict = true;
        } else if (
          (originalArray.length > index + 1 &&
            originalArray[index + 1].added == undefined) ||
          index + 1 === originalArray.length
        ) {
          //Line added locally and remove remote
          content =
            content +
            `<<<<<<< Local:${filePath}\n${result.value}=======\n>>>>>>> Remote:${filePath}\n`;
          firstChunkProcessed = false;
          changedLocaly = true;
        } else {
          content =
            content + `<<<<<<< Local:${filePath}\n${result.value}=======\n`;
          firstChunkProcessed = true;
          conflict = true;
        }
      } else if (result.added) {
        if (firstChunkProcessed) {
          content = content + `${result.value}>>>>>>> Remote:${filePath}\n`;
          firstChunkProcessed = false;
          conflict = true;
        } else if (
          (originalArray.length > index + 1 &&
            originalArray[index + 1].removed == undefined &&
            originalArray[index + 1].added == undefined) ||
          index + 1 === originalArray.length
        ) {
          //Line added locally and remove remote
          content =
            content +
            `<<<<<<< Local:${filePath}\n=======\n${result.value}>>>>>>> Remote:${filePath}\n`;
          firstChunkProcessed = false;
          changedRemote = true;
        } else {
          //This should never happen
          content =
            content + `<<<<<<< Local:${filePath}\n${result.value}=======\n`;
          firstChunkProcessed = true;
          conflict = true;
        }
      } else {
        content = content + result.value;
      }
    }
    if (this.addConflictMarkers) {
      fs.writeFileSync(filePath, content);
    }
    let status = "No Change";
    if (conflict || (changedLocaly && changedRemote)) {
      status = "Conflict";
    } else if (changedRemote) {
      status = "Remote Change";
    } else if (changedLocaly) {
      status = "Local Change";
    }
    let metaType = metadataInfo_1.MetadataInfo.getMetadataName(filePath, false);
    let member = metadataFiles_1.default.getMemberNameFromFilepath(
      filePath,
      metaType
    );
    if (conflict || changedLocaly || changedRemote) {
      this.output.push({
        status: status,
        metadataType: metaType,
        componentName: member,
        path: filePath,
      });
    }
  }
  retrievePackage(packageObj) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Clear temp folder ",
        sfpowerkit_1.LoggerLevel.INFO
      );
      rimraf.sync("temp_sfpowerkit");
      const apiversion = yield this.org.getConnection().retrieveMaxApiVersion();
      let retrieveRequest = {
        apiVersion: apiversion,
      };
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: packageObj,
      };
      // if(!this.flags.json)
      // this.ux.logJson(retrieveRequest);
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      conn.metadata.pollTimeout = 60;
      let retrievedId;
      sfpowerkit_1.SFPowerkit.log(
        "Retrieve request sent ",
        sfpowerkit_1.LoggerLevel.INFO
      );
      yield conn.metadata.retrieve(retrieveRequest, function (error, result) {
        if (error) {
          return console.error(error);
        }
        retrievedId = result.id;
      });
      sfpowerkit_1.SFPowerkit.setStatus(
        "Retrieving metadata | WAITING for retrieve request "
      );
      let metadata_retrieve_result = yield checkRetrievalStatus_1.checkRetrievalStatus(
        conn,
        retrievedId,
        false
      );
      sfpowerkit_1.SFPowerkit.setStatus("Retrieving metadata");
      sfpowerkit_1.SFPowerkit.log(
        "Retrieve completed. Writing retrieved metadata to disk ",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      if (!metadata_retrieve_result.zipFile)
        throw new Error("Error while retrieveing metadata");
      var zipFileName = "temp_sfpowerkit/unpackaged.zip";
      fs.mkdirSync("temp_sfpowerkit");
      fs.writeFileSync(zipFileName, metadata_retrieve_result.zipFile, {
        encoding: "base64",
      });
      sfpowerkit_1.SFPowerkit.log(
        "Extracting retrieved metadata ",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      yield extract_1.extract(
        `./temp_sfpowerkit/unpackaged.zip`,
        "temp_sfpowerkit/mdapi"
      );
      let maxApiVersion = yield this.org.retrieveMaxApiVersion();
      fs.mkdirSync("temp_sfpowerkit/source");
      sfpowerkit_1.SFPowerkit.log(
        "Converting retrieved metadata to dx format",
        sfpowerkit_1.LoggerLevel.INFO
      );
      let sfdxProjectJson = `{
        "packageDirectories": [
          {
            "path": "source",
            "default": true
          }
        ],
        "namespace": "",
        "sfdcLoginUrl": "https://login.salesforce.com",
        "sourceApiVersion": "${maxApiVersion}"
      }`;
      fs.writeFileSync("temp_sfpowerkit/sfdx-project.json", sfdxProjectJson);
      GetNodeWrapper_1.loadSFDX();
      yield parallel_1.sfdx.force.mdapi.convert({
        quiet: false,
        cwd: path.join(process.cwd(), "temp_sfpowerkit"),
        rootdir: "mdapi",
        outputdir: "source",
      });
      //Should remove the mdapi folder
      rimraf.sync("temp_sfpowerkit/mdapi");
      rimraf.sync("temp_sfpowerkit/unpackaged.zip");
    });
  }
}
exports.default = OrgDiffImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnRGlmZkltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L29yZ2RpZmYvb3JnRGlmZkltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBTTZDO0FBRTdDLDZDQUErQjtBQUMvQiwyQ0FBNkI7QUFDN0Isb0RBQThEO0FBQzlELHlFQUFpRDtBQUNqRCx5RkFBaUU7QUFDakUsZ0VBQXdDO0FBRXhDLDhFQUEyRTtBQUUzRSxvREFBaUQ7QUFDakQsK0NBQWlDO0FBQ2pDLGdGQUF3RDtBQUN4RCw4RUFBc0Q7QUFDdEQsd0VBQWdEO0FBQ2hELHFFQUE0RDtBQUM1RCx5REFBa0Q7QUFFbEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRS9CLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFFdEIsTUFBTSwyQkFBMkIsR0FBRyxpQ0FBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDbkUsT0FBTyxDQUNMLElBQUksQ0FBQyxPQUFPLEtBQUssNEJBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTztRQUM5QyxJQUFJLENBQUMsT0FBTyxLQUFLLDRCQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDckQsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNaLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztBQUM5QixDQUFDLENBQUMsQ0FBQztBQUVILE1BQXFCLFdBQVc7SUFFOUIsWUFDVSxjQUF3QixFQUN4QixHQUFRLEVBQ1Isa0JBQTJCO1FBRjNCLG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQ3hCLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFDUix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7UUFK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
