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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const rimraf = __importStar(require("rimraf"));
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
// tslint:disable-next-line:ordered-imports
var path = require("path");
const checkRetrievalStatus_1 = require("../../utils/checkRetrievalStatus");
const checkDeploymentStatus_1 = require("../../utils/checkDeploymentStatus");
const extract_1 = require("../../utils/extract");
const zipDirectory_1 = require("../../utils/zipDirectory");
const sfpowerkit_1 = require("../../sfpowerkit");
class RelaxIPRangeImpl {
  static setIp(
    conn,
    username,
    ipRangeToSet,
    addall = false,
    removeall = false
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      const apiversion = yield conn.retrieveMaxApiVersion();
      let retrieveRequest = {
        apiVersion: apiversion,
      };
      //Retrieve Duplicate Rule
      retrieveRequest["singlePackage"] = true;
      retrieveRequest["unpackaged"] = {
        types: { name: "Settings", members: "Security" },
      };
      conn.metadata.pollTimeout = 60;
      let retrievedId;
      yield conn.metadata.retrieve(retrieveRequest, function (error, result) {
        if (error) {
          return console.error(error);
        }
        retrievedId = result.id;
      });
      sfpowerkit_1.SFPowerkit.log(
        `Fetching Ip range from ${conn.getUsername()}`,
        sfpowerkit_1.LoggerLevel.DEBUG
      );
      let metadata_retrieve_result = yield checkRetrievalStatus_1.checkRetrievalStatus(
        conn,
        retrievedId
      );
      if (!metadata_retrieve_result.zipFile)
        sfpowerkit_1.SFPowerkit.log(
          "Unable to find the settings",
          sfpowerkit_1.LoggerLevel.ERROR
        );
      let retriveLocation = `temp_sfpowerkit_${retrievedId}`;
      //Extract Matching Rule
      var zipFileName = `${retriveLocation}/unpackaged.zip`;
      fs.mkdirSync(retriveLocation);
      fs.writeFileSync(zipFileName, metadata_retrieve_result.zipFile, {
        encoding: "base64",
      });
      yield extract_1.extract(
        `./${retriveLocation}/unpackaged.zip`,
        retriveLocation
      );
      fs.unlinkSync(zipFileName);
      let resultFile = `${retriveLocation}/settings/Security.settings`;
      if (fs.existsSync(path.resolve(resultFile))) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        let retrieve_securitySetting = yield parseString(
          fs.readFileSync(path.resolve(resultFile))
        );
        if (addall) {
          ipRangeToSet = this.getFullRange();
          sfpowerkit_1.SFPowerkit.log(
            `Ip range to set : 0.0.0.0-255.255.255.255`,
            sfpowerkit_1.LoggerLevel.INFO
          );
        } else if (ipRangeToSet.length > 0) {
          sfpowerkit_1.SFPowerkit.log(
            `Ip range to set :` + JSON.stringify(ipRangeToSet),
            sfpowerkit_1.LoggerLevel.INFO
          );
        }
        if (!retrieve_securitySetting.SecuritySettings.networkAccess) {
          if (removeall) {
            sfpowerkit_1.SFPowerkit.log(
              `Currently No Ip range set in ${conn.getUsername()} to remove.`,
              sfpowerkit_1.LoggerLevel.INFO
            );
            rimraf.sync(retriveLocation);
            return { username: username, success: true };
          } else {
            retrieve_securitySetting.SecuritySettings.networkAccess = {
              ipRanges: ipRangeToSet,
            };
            sfpowerkit_1.SFPowerkit.log(
              `Currently No Ip range set in ${conn.getUsername()}.`,
              sfpowerkit_1.LoggerLevel.DEBUG
            );
          }
        } else {
          let currentRange =
            retrieve_securitySetting.SecuritySettings.networkAccess.ipRanges;
          sfpowerkit_1.SFPowerkit.log(
            `Org ${conn.getUsername()} has current range : ` +
              JSON.stringify(currentRange),
            sfpowerkit_1.LoggerLevel.DEBUG
          );
          if (!addall && !removeall) {
            if (currentRange.constructor === Array) {
              ipRangeToSet.concat(currentRange);
            } else {
              ipRangeToSet.push(currentRange);
            }
          }
          retrieve_securitySetting.SecuritySettings.networkAccess.ipRanges = ipRangeToSet;
        }
        let builder = new xml2js.Builder();
        var xml = builder.buildObject(retrieve_securitySetting);
        fs.writeFileSync(resultFile, xml);
        var zipFile = `${retriveLocation}/package.zip`;
        yield zipDirectory_1.zipDirectory(retriveLocation, zipFile);
        //Deploy Trigger
        conn.metadata.pollTimeout = 300;
        let deployId;
        var zipStream = fs.createReadStream(zipFile);
        yield conn.metadata.deploy(
          zipStream,
          { rollbackOnError: true, singlePackage: true },
          function (error, result) {
            if (error) {
              return console.error(error);
            }
            deployId = result;
          }
        );
        sfpowerkit_1.SFPowerkit.log(
          `${removeall ? "Removing all" : "Setting"} Ip range with ID  ${
            deployId.id
          } to ${conn.getUsername()}`,
          sfpowerkit_1.LoggerLevel.DEBUG
        );
        let metadata_deploy_result = yield checkDeploymentStatus_1.checkDeploymentStatus(
          conn,
          deployId.id
        );
        rimraf.sync(retriveLocation);
        if (!metadata_deploy_result.success) {
          sfpowerkit_1.SFPowerkit.log(
            `Unable to ${removeall ? "remove" : "set"} ip range : ${
              metadata_deploy_result.details["componentFailures"]["problem"]
            }`,
            sfpowerkit_1.LoggerLevel.ERROR
          );
          return { username: username, success: false };
        } else {
          sfpowerkit_1.SFPowerkit.log(
            `Ip range is successfully ${
              removeall ? "removed" : "set"
            } in ${conn.getUsername()}`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          return { username: username, success: true };
        }
      }
    });
  }
  static getFullRange() {
    let ipRangeToSet = [];
    for (let i = 0; i < 255; i += 2) {
      ipRangeToSet.push({ start: `${i}.0.0.0`, end: `${i + 1}.255.255.255` });
    }
    return ipRangeToSet;
  }
}
exports.default = RelaxIPRangeImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXhJUFJhbmdlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9pbXBsL29yZy9yZWxheElQUmFuZ2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrQ0FBaUM7QUFHakMsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUU3QiwyQ0FBMkM7QUFDM0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLDJFQUF3RTtBQUN4RSw2RUFBMEU7QUFDMUUsaURBQThDO0FBQzlDLDJEQUF3RDtBQUN4RCxpREFBMkQ7QUFFM0QsTUFBcUIsZ0JBQWdCO0lBQzVCLE1BQU0sQ0FBTyxLQUFLLENBQ3ZCLElBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLFlBQW1CLEVBQ25CLFNBQWtCLEtBQUssRUFDdkIsWUFBcUIsS0FBSzs7WUFFMUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUV0RCxJQUFJLGVBQWUsR0FBRztnQkFDcEIsVUFBVSxFQUFFLFVBQVU7YUFDdkIsQ0FBQztZQUVGLHlCQUF5QjtZQUN6QixlQUFlLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3hDLGVBQWUsQ0FBQyxZQUFZLENBQUMsR0FBRztnQkFDOUIsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFO2FBQ2pELENBQUM7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxXQUFXLENBQUM7WUFDaEIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsVUFDNUMsS0FBSyxFQUNMLE1BQW1CO2dCQUVuQixJQUFJLEtBQUssRUFBRTtvQkFDVCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdCO2dCQUNELFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsdUJBQVUsQ0FBQyxHQUFHLENBQ1osMEJBQTBCLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUM5Qyx3QkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztZQUVGLElBQUksd0JBQXdCLEdBQUcsTUFBTSwyQ0FBb0IsQ0FDdkQsSUFBSSxFQUNKLFdBQVcsQ0FDWixDQUFDO1lBQ0YsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU87Z0JBQ25DLHVCQUFVLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLHdCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFbkUsSUFBSSxlQUFlLEdBQUcsbUJBQW1CLFdBQVcsRUFBRSxDQUFDO1lBQ3ZELHVCQUF1QjtZQUN2QixJQUFJLFdBQVcsR0FBRyxHQUFHLGVBQWUsaUJBQWlCLENBQUM7WUFDdEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QixFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLEVBQUU7Z0JBQzlELFFBQVEsRUFBRSxRQUFRO2FBQ25CLENBQUMsQ0FBQztZQUVILE1BQU0saUJBQU8sQ0FBQyxLQUFLLGVBQWUsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdEUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQixJQUFJLFVBQVUsR0FBRyxHQUFHLGVBQWUsNkJBQTZCLENBQUM7WUFFakUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUV2RCxJQUFJLHdCQUF3QixHQUFHLE1BQU0sV0FBVyxDQUM5QyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDMUMsQ0FBQztnQkFFRixJQUFJLE1BQU0sRUFBRTtvQkFDVixZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNuQyx1QkFBVSxDQUFDLEdBQUcsQ0FDWiwyQ0FBMkMsRUFDM0Msd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7aUJBQ0g7cUJBQU0sSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEMsdUJBQVUsQ0FBQyxHQUFHLENBQ1osbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFDbEQsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7aUJBQ0g7Z0JBRUQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRTtvQkFDNUQsSUFBSSxTQUFTLEVBQUU7d0JBQ2IsdUJBQVUsQ0FBQyxHQUFHLENBQ1osZ0NBQWdDLElBQUksQ0FBQyxXQUFXLEVBQUUsYUFBYSxFQUMvRCx3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQzt3QkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUM3QixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7cUJBQzlDO3lCQUFNO3dCQUNMLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBRzs0QkFDeEQsUUFBUSxFQUFFLFlBQVk7eUJBQ3ZCLENBQUM7d0JBQ0YsdUJBQVUsQ0FBQyxHQUFHLENBQ1osZ0NBQWdDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUNyRCx3QkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztxQkFDSDtpQkFDRjtxQkFBTTtvQkFDTCxJQUFJLFlBQVksR0FDZCx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO29CQUVuRSx1QkFBVSxDQUFDLEdBQUcsQ0FDWixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsdUJBQXVCO3dCQUM5QyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUM5Qix3QkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztvQkFFRixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUN6QixJQUFJLFlBQVksQ0FBQyxXQUFXLEtBQUssS0FBSyxFQUFFOzRCQUN0QyxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUNuQzs2QkFBTTs0QkFDTCxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUNqQztxQkFDRjtvQkFDRCx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztpQkFDakY7Z0JBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25DLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDeEQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRWxDLElBQUksT0FBTyxHQUFHLEdBQUcsZUFBZSxjQUFjLENBQUM7Z0JBQy9DLE1BQU0sMkJBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRTdDLGdCQUFnQjtnQkFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO2dCQUNoQyxJQUFJLFFBQXFCLENBQUM7Z0JBRTFCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDeEIsU0FBUyxFQUNULEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQzlDLFVBQVMsS0FBSyxFQUFFLE1BQW1CO29CQUNqQyxJQUFJLEtBQUssRUFBRTt3QkFDVCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQzdCO29CQUNELFFBQVEsR0FBRyxNQUFNLENBQUM7Z0JBQ3BCLENBQUMsQ0FDRixDQUFDO2dCQUVGLHVCQUFVLENBQUMsR0FBRyxDQUNaLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFNBQVMsc0JBQ3ZDLFFBQVEsQ0FBQyxFQUNYLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQzNCLHdCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO2dCQUNGLElBQUksc0JBQXNCLEdBQWlCLE1BQU0sNkNBQXFCLENBQ3BFLElBQUksRUFDSixRQUFRLENBQUMsRUFBRSxDQUNaLENBQUM7Z0JBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFN0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRTtvQkFDbkMsdUJBQVUsQ0FBQyxHQUFHLENBQ1osYUFBYSxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxlQUN2QyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxTQUFTLENBQy9ELEVBQUUsRUFDRix3QkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztvQkFDRixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7aUJBQy9DO3FCQUFNO29CQUNMLHVCQUFVLENBQUMsR0FBRyxDQUNaLDRCQUNFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUMzQix3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztvQkFDRixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQzlDO2FBQ0Y7UUFDSCxDQUFDO0tBQUE7SUFDTSxNQUFNLENBQUMsWUFBWTtRQUN4QixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztDQUNGO0FBOUtELG1DQThLQyJ9
