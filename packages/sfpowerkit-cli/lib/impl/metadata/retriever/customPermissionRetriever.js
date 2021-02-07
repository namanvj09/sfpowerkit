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
const _ = __importStar(require("lodash"));
const metadataInfo_1 = require("../metadataInfo");
const baseMetadataRetriever_1 = __importDefault(
  require("./baseMetadataRetriever")
);
const metadataFiles_1 = __importDefault(require("../metadataFiles"));
const QUERY = "SELECT Id, DeveloperName, NamespacePrefix From CustomPermission";
class CustomPermissionRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, false);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!CustomPermissionRetriever.instance) {
      CustomPermissionRetriever.instance = new CustomPermissionRetriever(org);
    }
    return CustomPermissionRetriever.instance;
  }
  getObjects() {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      if (
        (this.data === undefined || this.data.length == 0) &&
        !this.dataLoaded
      ) {
        _super.setQuery.call(this, QUERY);
        let customPermissions = yield _super.getObjects.call(this);
        if (customPermissions != undefined && customPermissions.length > 0) {
          for (let i = 0; i < customPermissions.length; i++) {
            let cp = customPermissions[i];
            if (!_.isNil(cp.NamespacePrefix)) {
              cp.FullName = `${cp.NamespacePrefix}__${cp.DeveloperName}`;
            } else {
              cp.FullName = cp.DeveloperName;
            }
          }
        }
        this.data = customPermissions;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getCustomPermissions() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  customPermissionExists(customPermissionStr) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomPermission.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomPermission.components.includes(
          customPermissionStr
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let custumPermissions = yield this.getCustomPermissions();
        let foundCp = custumPermissions.find((customPermission) => {
          return customPermission.FullName === customPermissionStr;
        });
        found = !_.isNil(foundCp);
      }
      return found;
    });
  }
}
exports.default = CustomPermissionRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tUGVybWlzc2lvblJldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci9jdXN0b21QZXJtaXNzaW9uUmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDBDQUE0QjtBQUM1QixrREFBZ0Q7QUFDaEQsb0ZBQTREO0FBQzVELHFFQUE2QztBQUU3QyxNQUFNLEtBQUssR0FBRyxpRUFBaUUsQ0FBQztBQUNoRixNQUFxQix5QkFBMEIsU0FBUSwrQkFFdEQ7SUFFQyxZQUEyQixHQUFRO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFETyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBUTtRQUNoQyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLHlCQUF5QixDQUFDLFFBQVEsR0FBRyxJQUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsT0FBTyx5QkFBeUIsQ0FBQyxRQUFRLENBQUM7SUFDNUMsQ0FBQztJQUVZLFVBQVU7Ozs7OztZQUNyQixJQUNFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ2hCO2dCQUNBLE9BQU0sUUFBUSxZQUFDLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxpQkFBaUIsR0FBRyxNQUFNLE9BQU0sVUFBVSxXQUFFLENBQUM7Z0JBQ2pELElBQUksaUJBQWlCLElBQUksU0FBUyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ2pELElBQUksRUFBRSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ2hDLEVBQUUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQzt5QkFDNUQ7NkJBQU07NEJBQ0wsRUFBRSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO3lCQUNoQztxQkFDRjtpQkFDRjtnQkFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO2dCQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzthQUN4QjtZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFFWSxvQkFBb0I7O1lBQy9CLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0lBRVksc0JBQXNCLENBQ2pDLG1CQUEyQjs7WUFFM0IsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLDZCQUE2QjtZQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw0QkFBYSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN2RCxLQUFLLEdBQUcsNEJBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUN4RCxtQkFBbUIsQ0FDcEIsQ0FBQzthQUNIO1lBQ0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLHVCQUFhLENBQUMsVUFBVSxFQUFFO2dCQUN2Qyw2QkFBNkI7Z0JBQzdCLElBQUksaUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDMUQsSUFBSSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtvQkFDeEQsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLEtBQUssbUJBQW1CLENBQUM7Z0JBQzNELENBQUMsQ0FBQyxDQUFDO2dCQUNILEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0I7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7S0FBQTtDQUNGO0FBaEVELDRDQWdFQyJ9
