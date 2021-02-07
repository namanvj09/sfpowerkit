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
const retrieveMetadata_1 = require("../../../utils/retrieveMetadata");
const core_1 = require("@salesforce/core");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const metadataInfo_1 = require("../../../impl/metadata/metadataInfo");
const profileRetriever_1 = __importDefault(
  require("../../../impl/metadata/retriever/profileRetriever")
);
const profileWriter_1 = __importDefault(
  require("../../../impl/metadata/writer/profileWriter")
);
const sfpowerkit_1 = require("../../../sfpowerkit");
const metadataFiles_1 = __importDefault(
  require("../../../impl/metadata/metadataFiles")
);
const diff_match_patch_1 = require("diff-match-patch");
require("diff-match-patch-line-and-word"); // import globally to  enhanse the class
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const rimraf = __importStar(require("rimraf"));
const progressBar_1 = require("../../../ui/progressBar");
const dmp = new diff_match_patch_1.diff_match_patch();
const CRLF_REGEX = /\r\n/;
const LF_REGEX = /\n/;
class ProfileDiffImpl {
  constructor(profileList, sourceOrgStr, targetOrg, outputFolder) {
    this.profileList = profileList;
    this.sourceOrgStr = sourceOrgStr;
    this.targetOrg = targetOrg;
    this.outputFolder = outputFolder;
    this.sourceOrg = null;
    this.output = [];
    this.sourceLabel = "Local";
    this.targetLabel = "Remote";
    this.targetLabel = this.targetOrg.getConnection().getUsername();
  }
  diff() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Profile diff start. ",
        core_1.LoggerLevel.INFO
      );
      if (this.outputFolder) {
        rimraf.sync(this.outputFolder);
      }
      let profileSource = null;
      //let profileXmlMapPromise: Promise<string[]> = null;
      if (this.sourceOrgStr) {
        sfpowerkit_1.SFPowerkit.log(
          "Creating source org ",
          core_1.LoggerLevel.INFO
        );
        this.sourceOrg = yield core_1.Org.create({
          aliasOrUsername: this.sourceOrgStr,
          isDevHub: false,
        });
      }
      if (
        (!this.profileList || this.profileList.length === 0) &&
        this.sourceOrgStr
      ) {
        this.sourceLabel = this.sourceOrg.getConnection().getUsername();
        sfpowerkit_1.SFPowerkit.log(
          "No profile provided, loading all profiles from source org. ",
          core_1.LoggerLevel.INFO
        );
        let conn = this.sourceOrg.getConnection();
        let profileNamesPromise = retrieveMetadata_1.retrieveMetadata(
          [{ type: "Profile", folder: null }],
          conn
        );
        profileSource = profileNamesPromise.then((profileNames) => {
          return this.retrieveProfiles(profileNames, this.sourceOrg);
        });
      } else {
        sfpowerkit_1.SFPowerkit.log(
          "Reading profiles from file system. ",
          core_1.LoggerLevel.INFO
        );
        let srcFolders = yield sfpowerkit_1.SFPowerkit.getProjectDirectories();
        let metadataFiles = new metadataFiles_1.default();
        sfpowerkit_1.SFPowerkit.log(
          "Source Folders are",
          core_1.LoggerLevel.DEBUG
        );
        for (let i = 0; i < srcFolders.length; i++) {
          let srcFolder = srcFolders[i];
          let normalizedPath = path.join(process.cwd(), srcFolder);
          metadataFiles.loadComponents(normalizedPath);
        }
        if (!this.profileList || this.profileList.length === 0) {
          this.profileList = metadataInfo_1.METADATA_INFO.Profile.files;
        } else {
          this.profileList = this.profileList.map((profilename) => {
            const foundFile = metadataInfo_1.METADATA_INFO.Profile.files.find(
              (file) => {
                const apiName = metadataFiles_1.default.getFullApiName(file);
                return apiName === profilename;
              }
            );
            if (!foundFile) {
              sfpowerkit_1.SFPowerkit.log(
                "No profile found with name  " + profilename,
                core_1.LoggerLevel.INFO
              );
            }
            return foundFile;
          });
          this.profileList = this.profileList.filter((file) => {
            return file !== undefined;
          });
        }
        if (!this.profileList || this.profileList.length === 0) {
          sfpowerkit_1.SFPowerkit.log(
            "No profile to process ",
            core_1.LoggerLevel.INFO
          );
          return null;
        }
        if (!this.outputFolder) {
          this.outputFolder = path.dirname(this.profileList[0]);
        }
        let profilesMap = [];
        let progressBar = new progressBar_1.ProgressBar();
        progressBar.create(
          "Reading from File System ",
          "Profiles",
          core_1.LoggerLevel.FATAL
        );
        progressBar.start(this.profileList.length);
        for (let i = 0; i < this.profileList.length; i++) {
          let profilepath = this.profileList[i];
          sfpowerkit_1.SFPowerkit.log(
            "Reading profile from path " + profilepath,
            core_1.LoggerLevel.DEBUG
          );
          let profileXml = fs.readFileSync(profilepath);
          let profileName = path.basename(
            profilepath,
            metadataInfo_1.METADATA_INFO.Profile.sourceExtension
          );
          profilesMap.push({
            [profileName]: profileXml.toString(),
          });
          progressBar.increment(1);
        }
        profileSource = new Promise((resolve, reject) => {
          resolve(profilesMap);
        });
        progressBar.stop();
      }
      if (!fs.existsSync(this.outputFolder)) {
        console.log("Creattin output diff " + this.outputFolder);
        fileutils_1.default.mkDirByPathSync(this.outputFolder);
      }
      //REtrieve profiles from target
      return profileSource.then((profilesSourceMap) => {
        let profileNames = [];
        profilesSourceMap.forEach((profileXml) => {
          profileNames.push(...Object.keys(profileXml));
        });
        let targetConn = this.targetOrg.getConnection();
        let profileNamesPromise = retrieveMetadata_1.retrieveMetadata(
          [{ type: "Profile", folder: null }],
          targetConn
        );
        let profileTarget = profileNamesPromise
          .then((targetProfileNames) => {
            let profileToRetrieveinTarget = profileNames.filter(
              (oneProfile) => {
                return targetProfileNames.includes(oneProfile);
              }
            );
            return this.retrieveProfiles(
              profileToRetrieveinTarget,
              this.targetOrg
            );
          })
          .catch((error) => {
            console.log(error.message);
            return [];
          });
        return profileTarget
          .then((profilesTargetMap) => {
            sfpowerkit_1.SFPowerkit.log(
              "Handling diff ",
              core_1.LoggerLevel.INFO
            );
            let progressBar = new progressBar_1.ProgressBar().create(
              "Diff processing ",
              "Profiles",
              core_1.LoggerLevel.INFO
            );
            progressBar.start(profilesSourceMap.length);
            for (let i = 0; i < profilesSourceMap.length; i++) {
              let sourceProfileXml = profilesSourceMap[i];
              let sourceKeys = Object.keys(sourceProfileXml);
              let sourceProfileName = sourceKeys[0];
              let targetProfileXml = profilesTargetMap.find((targetProfile) => {
                let targetKeys = Object.keys(targetProfile);
                let targetProfileName = targetKeys[0];
                return targetProfileName === sourceProfileName;
              });
              sfpowerkit_1.SFPowerkit.log(
                "Processing profile " + sourceProfileName,
                core_1.LoggerLevel.DEBUG
              );
              let sourceContent = sourceProfileXml[sourceProfileName];
              let targetContent = "";
              if (targetProfileXml) {
                targetContent = targetProfileXml[sourceProfileName];
              }
              let filePath =
                this.outputFolder +
                path.sep +
                sourceProfileName +
                metadataInfo_1.METADATA_INFO.Profile.sourceExtension;
              sfpowerkit_1.SFPowerkit.log(
                "Processing diff for profile " + sourceProfileName,
                core_1.LoggerLevel.DEBUG
              );
              this.processDiff(filePath, sourceContent, targetContent);
              progressBar.increment(1);
            }
            /*
                    profilesSourceMap.forEach(sourceProfileXml => {
                      
                    });
                    */
            progressBar.stop();
            return this.output;
          })
          .catch((error) => {
            console.log(error.message);
          });
      });
    });
  }
  retrieveProfiles(profileNames, retrieveOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let i,
        j,
        chunk = 10,
        temparray;
      let profileRetriever = new profileRetriever_1.default(retrieveOrg, false);
      let retrievePromises = [];
      let connection = retrieveOrg.getConnection();
      let progressBar = new progressBar_1.ProgressBar().create(
        `Retrieving From ${connection.getUsername()}`,
        "Profiles",
        core_1.LoggerLevel.INFO
      );
      progressBar.start(profileNames.length);
      for (i = 0, j = profileNames.length; i < j; i += chunk) {
        temparray = profileNames.slice(i, i + chunk);
        let metadataListPromise = profileRetriever.loadProfiles(
          temparray,
          connection
        );
        retrievePromises.push(
          metadataListPromise
            .then((metadataList) => {
              let profileWriter = new profileWriter_1.default();
              let profilesXmls = [];
              for (let count = 0; count < metadataList.length; count++) {
                //console.log(metadataList[count]);
                let profileObj = metadataList[count];
                let profileXml = profileWriter.toXml(profileObj);
                profilesXmls.push({
                  [profileObj.fullName]: profileXml,
                });
                progressBar.increment(1);
              }
              return profilesXmls;
            })
            .catch((error) => {
              console.error(error.message);
              progressBar.stop();
              return [];
            })
        );
      }
      return Promise.all(retrievePromises)
        .then((metadataList) => {
          let profiles = [];
          metadataList.forEach((elem) => {
            profiles.push(...elem);
          });
          progressBar.stop();
          return profiles;
        })
        .catch((error) => {
          console.error(error.message);
          progressBar.stop();
          return [];
        });
    });
  }
  processDiff(filePath, contentSource, contentTarget) {
    let lineEnd = "\n";
    let content = "";
    let changedLocaly = false;
    let changedRemote = false;
    let conflict = false;
    //Normalise line ending on windows
    let matcherLocal = contentSource.match(CRLF_REGEX);
    let matcherFetched = contentTarget.match(CRLF_REGEX);
    if (matcherLocal && !matcherFetched) {
      lineEnd = matcherLocal[0];
      contentTarget = contentTarget.split(LF_REGEX).join(lineEnd);
    }
    if (!contentSource.endsWith(lineEnd) && contentTarget.endsWith(lineEnd)) {
      contentTarget = contentTarget.substr(
        0,
        contentTarget.lastIndexOf(lineEnd)
      );
    }
    if (contentSource.endsWith(lineEnd) && !contentTarget.endsWith(lineEnd)) {
      contentTarget = contentTarget + lineEnd;
    }
    sfpowerkit_1.SFPowerkit.log("Running diff", core_1.LoggerLevel.DEBUG);
    //let diffResult = jsdiff.diffLines(contentSource, contentTarget);
    const diffResult = dmp.diff_lineMode(contentSource, contentTarget);
    sfpowerkit_1.SFPowerkit.log(
      "Diff run completed. Processing result",
      core_1.LoggerLevel.DEBUG
    );
    for (let i = 0; i < diffResult.length; i++) {
      let result = diffResult[i];
      let index = i;
      let originalArray = diffResult;
      let nextIndex = index + 1;
      let nextElem = undefined;
      if (originalArray.length >= nextIndex) {
        nextElem = originalArray[nextIndex];
      }
      let value = result[1];
      let status = result[0];
      if (status === -1) {
        if (!value.endsWith(lineEnd)) {
          value = value + lineEnd;
        }
        if (nextElem !== undefined) {
          if (nextElem[0] === 0) {
            content =
              content +
              `<<<<<<< ${this.sourceLabel}:${filePath}\n${value}=======\n>>>>>>> ${this.targetLabel}:${filePath}\n`;
            changedLocaly = true;
          } else if (nextElem[0] === 1) {
            content =
              content +
              `<<<<<<< ${this.sourceLabel}:${filePath}\n${value}=======\n`;
            conflict = true;
          }
        } else {
          content =
            content +
            `<<<<<<< ${this.sourceLabel}:${filePath}\n${value}=======\n>>>>>>> ${this.targetLabel}:${filePath}\n`;
          changedLocaly = true;
        }
      } else if (status === 1) {
        if (conflict) {
          content =
            content + `${value}>>>>>>> ${this.targetLabel}:${filePath}\n`;
          conflict = true;
        } else {
          content =
            content +
            `<<<<<<< ${this.sourceLabel}:${filePath}\n=======\n${value}>>>>>>> ${this.targetLabel}:${filePath}\n`;
          changedRemote = true;
        }
      } else {
        content = content + value;
      }
    }
    sfpowerkit_1.SFPowerkit.log("Result processed", core_1.LoggerLevel.DEBUG);
    fs.writeFileSync(filePath, content);
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
}
exports.default = ProfileDiffImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZURpZmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9zb3VyY2UvcHJvZmlsZXMvcHJvZmlsZURpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQW1FO0FBQ25FLDJDQUFvRDtBQUNwRCwyQ0FBNkI7QUFDN0IsdUNBQXlCO0FBQ3pCLHNFQUc2QztBQUM3Qyx5R0FBaUY7QUFDakYsZ0dBQXdFO0FBRXhFLG9EQUFpRDtBQUNqRCx5RkFBaUU7QUFFakUsdURBQW9EO0FBQ3BELDBDQUF3QyxDQUFDLHdDQUF3QztBQUNqRix5RUFBaUQ7QUFDakQsK0NBQWlDO0FBQ2pDLHlEQUFzRDtBQUV0RCxNQUFNLEdBQUcsR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7QUFFbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQzFCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUV0QixNQUFxQixlQUFlO0lBS2xDLFlBQ1UsV0FBcUIsRUFDckIsWUFBb0IsRUFDcEIsU0FBYyxFQUNkLFlBQW9CO1FBSHBCLGdCQUFXLEdBQVgsV0FBVyxDQUFVO1FBQ3JCLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFDZCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQVJ0QixjQUFTLEdBQVEsSUFBSSxDQUFDO1FBQ3ZCLFdBQU0sR0FBRyxFQUFFLENBQUM7UUFDWCxnQkFBVyxHQUFHLE9BQU8sQ0FBQztRQUN0QixnQkFBVyxHQUFHLFFBQVEsQ0FBQztRQU83QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbEUsQ0FBQztJQUNZLElBQUk7O1lBQ2YsdUJBQVUsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsa0JBQVcsQ0FBQyxJ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
