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
const metadataInfo_1 = require("../../metadata/metadataInfo");
const _ = __importStar(require("lodash"));
const profileActions_1 = __importDefault(require("./profileActions"));
const profileWriter_1 = __importDefault(
  require("../../../impl/metadata/writer/profileWriter")
);
const progressBar_1 = require("../../../ui/progressBar");
const unsupportedprofiles = [];
class ProfileSync extends profileActions_1.default {
  sync(srcFolders, profiles, isdelete) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Retrieving profiles",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      if (!_.isNil(profiles) && profiles.length !== 0) {
        sfpowerkit_1.SFPowerkit.log(
          "Requested  profiles are..",
          sfpowerkit_1.LoggerLevel.DEBUG
        );
        sfpowerkit_1.SFPowerkit.log(profiles, sfpowerkit_1.LoggerLevel.DEBUG);
      }
      let fetchNewProfiles = _.isNil(srcFolders) || srcFolders.length === 0;
      if (fetchNewProfiles) {
        srcFolders = yield sfpowerkit_1.SFPowerkit.getProjectDirectories();
      }
      this.metadataFiles = new metadataFiles_1.default();
      sfpowerkit_1.SFPowerkit.log(
        "Source Folders are",
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      sfpowerkit_1.SFPowerkit.log(srcFolders, sfpowerkit_1.LoggerLevel.DEBUG);
      for (let i = 0; i < srcFolders.length; i++) {
        let srcFolder = srcFolders[i];
        let normalizedPath = path.join(process.cwd(), srcFolder);
        this.metadataFiles.loadComponents(normalizedPath);
      }
      //get local profiles when profile path is provided
      if (!fetchNewProfiles && profiles.length < 1) {
        metadataInfo_1.METADATA_INFO.Profile.files.forEach((element) => {
          let oneName = path.basename(
            element,
            metadataInfo_1.METADATA_INFO.Profile.sourceExtension
          );
          profiles.push(oneName);
        });
      }
      //let profileList: string[] = [];
      let profileNames = [];
      let profilePathAssoc = {};
      let profileStatus = yield this.getProfileFullNamesWithLocalStatus(
        profiles
      );
      let metadataFiles = [];
      if (fetchNewProfiles) {
        //Retriving local profiles and anything extra found in the org
        metadataFiles = _.union(profileStatus.added, profileStatus.updated);
      } else {
        //Retriving only local profiles
        metadataFiles = profileStatus.updated;
        profileStatus.added = [];
      }
      metadataFiles.sort();
      sfpowerkit_1.SFPowerkit.log(
        profileStatus,
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      sfpowerkit_1.SFPowerkit.log(
        metadataFiles,
        sfpowerkit_1.LoggerLevel.TRACE
      );
      if (metadataFiles.length > 0) {
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
        var i,
          j,
          chunk = 10;
        var temparray;
        sfpowerkit_1.SFPowerkit.log(
          `Number of profiles found in the target org ${profileNames.length}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        let progressBar = new progressBar_1.ProgressBar().create(
          `Loading profiles in batches `,
          ` Profiles`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        progressBar.start(profileNames.length);
        for (i = 0, j = profileNames.length; i < j; i += chunk) {
          temparray = profileNames.slice(i, i + chunk);
          var metadataList = yield this.profileRetriever.loadProfiles(
            temparray,
            this.conn
          );
          let profileWriter = new profileWriter_1.default();
          for (var count = 0; count < metadataList.length; count++) {
            var profileObj = metadataList[count];
            profileWriter.writeProfile(
              profileObj,
              profilePathAssoc[profileObj.fullName]
            );
            //profileList.push(profileObj.fullName);
          }
          progressBar.increment(j - i > chunk ? chunk : j - i);
        }
        progressBar.stop();
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `No Profiles found to retrieve`,
          sfpowerkit_1.LoggerLevel.INFO
        );
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
}
exports.default = ProfileSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZVN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9zb3VyY2UvcHJvZmlsZXMvcHJvZmlsZVN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQThEO0FBQzlELGlGQUF5RDtBQUN6RCw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLDhEQUE0RDtBQUU1RCwwQ0FBNEI7QUFDNUIsc0VBQThDO0FBQzlDLGdHQUF3RTtBQUN4RSx5REFBc0Q7QUFFdEQsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFFL0IsTUFBcUIsV0FBWSxTQUFRLHdCQUFjO0lBR3hDLElBQUksQ0FDZixVQUFvQixFQUNwQixRQUFtQixFQUNuQixRQUFrQjs7WUFNbEIsdUJBQVUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsd0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0MsdUJBQVUsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsd0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0QsdUJBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHdCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0M7WUFFRCxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDdEUsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDcEIsVUFBVSxHQUFHLE1BQU0sdUJBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2FBQ3ZEO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFhLEVBQUUsQ0FBQztZQUV6Qyx1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
