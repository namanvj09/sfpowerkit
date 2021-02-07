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
const metadataInfo_1 = require("../../metadata/metadataInfo");
const sfpowerkit_1 = require("../../../sfpowerkit");
const path = __importStar(require("path"));
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const retrieveMetadata_1 = require("../../../utils/retrieveMetadata");
const profileRetriever_1 = __importDefault(
  require("../../metadata/retriever/profileRetriever")
);
class ProfileActions {
  constructor(org, debugFlag) {
    this.org = org;
    if (this.org !== undefined) {
      this.conn = this.org.getConnection();
    }
    this.debugFlag = debugFlag;
    this.profileRetriever = new profileRetriever_1.default(org, debugFlag);
  }
  getProfileFullNamesWithLocalStatus(profileNames) {
    return __awaiter(this, void 0, void 0, function* () {
      let profilesStatus = {
        added: [],
        deleted: [],
        updated: [],
      };
      let metadataFiles = metadataInfo_1.METADATA_INFO.Profile.files || [];
      //generate path for new profiles
      let profilePath = path.join(
        process.cwd(),
        yield sfpowerkit_1.SFPowerkit.getDefaultFolder(),
        "main",
        "default",
        "profiles"
      );
      if (metadataFiles && metadataFiles.length > 0) {
        profilePath = path.dirname(metadataFiles[0]);
      } else {
        //create folder structure
        fileutils_1.default.mkDirByPathSync(profilePath);
      }
      // Query the profiles from org
      const profiles = yield retrieveMetadata_1.retrieveMetadata(
        [{ type: "Profile", folder: null }],
        this.conn
      );
      if (profileNames && profileNames.length > 0) {
        for (let i = 0; i < profileNames.length; i++) {
          let profileName = profileNames[i];
          let found = false;
          for (let j = 0; j < metadataFiles.length; j++) {
            let profileComponent = metadataFiles[j];
            let oneName = path.basename(
              profileComponent,
              metadataInfo_1.METADATA_INFO.Profile.sourceExtension
            );
            if (profileName === oneName) {
              profilesStatus.updated.push(profileComponent);
              found = true;
              break;
            }
          }
          if (!found) {
            for (let k = 0; k < profiles.length; k++) {
              if (profiles[k] === profileName) {
                let newProfilePath = path.join(
                  profilePath,
                  profiles[k] +
                    metadataInfo_1.METADATA_INFO.Profile.sourceExtension
                );
                profilesStatus.added.push(newProfilePath);
                found = true;
                break;
              }
            }
          }
          if (!found) {
            profilesStatus.deleted.push(profileName);
          }
        }
      } else {
        sfpowerkit_1.SFPowerkit.log(
          "Load new profiles from server into the project directory",
          sfpowerkit_1.LoggerLevel.DEBUG
        );
        profilesStatus.deleted = metadataFiles.filter((file) => {
          let oneName = path.basename(
            file,
            metadataInfo_1.METADATA_INFO.Profile.sourceExtension
          );
          return !profiles.includes(oneName);
        });
        profilesStatus.updated = metadataFiles.filter((file) => {
          let oneName = path.basename(
            file,
            metadataInfo_1.METADATA_INFO.Profile.sourceExtension
          );
          return profiles.includes(oneName);
        });
        if (profiles && profiles.length > 0) {
          let newProfiles = profiles.filter((profileObj) => {
            let found = false;
            for (let i = 0; i < profilesStatus.updated.length; i++) {
              let profileComponent = profilesStatus.updated[i];
              let oneName = path.basename(
                profileComponent,
                metadataInfo_1.METADATA_INFO.Profile.sourceExtension
              );
              //escape some caracters
              let onlineName = profileObj.replace("'", "%27");
              onlineName = onlineName.replace("/", "%2F");
              if (onlineName === oneName) {
                found = true;
                break;
              }
            }
            return !found;
          });
          if (newProfiles && newProfiles.length > 0) {
            sfpowerkit_1.SFPowerkit.log(
              "New profiles founds",
              sfpowerkit_1.LoggerLevel.DEBUG
            );
            for (let i = 0; i < newProfiles.length; i++) {
              sfpowerkit_1.SFPowerkit.log(
                newProfiles[i],
                sfpowerkit_1.LoggerLevel.DEBUG
              );
              let newPRofilePath = path.join(
                profilePath,
                newProfiles[i] +
                  metadataInfo_1.METADATA_INFO.Profile.sourceExtension
              );
              profilesStatus.added.push(newPRofilePath);
            }
          } else {
            sfpowerkit_1.SFPowerkit.log(
              "No new profile found, Updating existing profiles",
              sfpowerkit_1.LoggerLevel.INFO
            );
          }
        }
      }
      return Promise.resolve(profilesStatus);
    });
  }
}
exports.default = ProfileActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9zb3VyY2UvcHJvZmlsZXMvcHJvZmlsZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOERBQTREO0FBQzVELG9EQUE4RDtBQUM5RCwyQ0FBNkI7QUFDN0IseUVBQWlEO0FBQ2pELHNFQUFtRTtBQUduRSxpR0FBeUU7QUFFekUsTUFBOEIsY0FBYztJQUsxQyxZQUEwQixHQUFRLEVBQUUsU0FBbUI7UUFBN0IsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNoQyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFnQixDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRWUsa0NBQWtDLENBQ2hELFlBQXNCOztZQU10QixJQUFJLGNBQWMsR0FBRztnQkFDbkIsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTyxFQUFFLEVBQUU7YUFDWixDQUFDO1lBQ0YsSUFBSSxhQUFhLEdBQUcsNEJBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUV0RCxnQ0FBZ0M7WUFDaEMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDekIsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiLE1BQU0sdUJBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUNuQyxNQUFNLEVBQ04sU0FBUyxFQUNULFVBQVUsQ0FDWCxDQUFDO1lBQ0YsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNMLHlCQUF5QjtnQkFDekIsbUJBQVMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDeEM7WUFFRCw4QkFBOEI7WUFDOUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxtQ0FBZ0IsQ0FDckMsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQ25DLElBQUksQ0FBQyxJQUFJLENBQ1YsQ0FBQztZQUVGLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDNUMsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM3QyxJQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FDekIsZ0JBQWdCLEVBQ2hCLDRCQUFhLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FDdEMsQ0FBQzt3QkFDRixJQUFJLFdBQVcsS0FBSyxPQUFPLEVBQUU7NEJBQzNCLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQzlDLEtBQUssR0FBRyxJQUFJLENBQUM7NEJBQ2IsTUFBTTt5QkFDUDtxQkFDRjtvQkFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUN4QyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7Z0NBQy9CLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQzVCLFdBQVcsRUFDWCxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsNEJBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUNwRCxDQUFDO2dDQUNGLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dDQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dDQUNiLE1BQU07NkJBQ1A7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDVixjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDMUM7aUJBQ0Y7YUFDRjtpQkFBTTtnQkFDTCx1QkFBVSxDQUFDLEdBQUcsQ0FDWiwwREFBMEQsRUFDMUQsd0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7Z0JBRUYsY0FBYyxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNuRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUN6QixJQUFJLEVBQ0osNEJBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUN0QyxDQUFDO29CQUNGLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxjQUFjLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ25ELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQ3pCLElBQUksRUFDSiw0QkFBYSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQ3RDLENBQUM7b0JBQ0YsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbkMsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDN0MsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO3dCQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3RELElBQUksZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDakQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FDekIsZ0JBQWdCLEVBQ2hCLDRCQUFhLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FDdEMsQ0FBQzs0QkFDRix1QkFBdUI7NEJBQ3ZCLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUNoRCxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQzVDLElBQUksVUFBVSxLQUFLLE9BQU8sRUFBRTtnQ0FDMUIsS0FBSyxHQUFHLElBQUksQ0FBQztnQ0FDYixNQUFNOzZCQUNQO3lCQUNGO3dCQUNELE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQ2hCLENBQUMsQ0FBQyxDQUFDO29CQUNILElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUN6Qyx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSx3QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN6RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDM0MsdUJBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLHdCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ2xELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQzVCLFdBQVcsRUFDWCxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsNEJBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUN2RCxDQUFDOzRCQUNGLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3lCQUMzQztxQkFDRjt5QkFBTTt3QkFDTCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixrREFBa0QsRUFDbEQsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjtZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQUE7Q0FDRjtBQS9JRCxpQ0ErSUMifQ==
