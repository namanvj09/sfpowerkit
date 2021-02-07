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
const QUERY =
  "SELECT Id, DeveloperName, NamespacePrefix From ExternalDataSource";
class ExternalDataSourceRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, false);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!ExternalDataSourceRetriever.instance) {
      ExternalDataSourceRetriever.instance = new ExternalDataSourceRetriever(
        org
      );
    }
    return ExternalDataSourceRetriever.instance;
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
        let dataSources = yield _super.getObjects.call(this);
        if (dataSources != undefined && dataSources.length > 0) {
          for (let i = 0; i < dataSources.length; i++) {
            let dts = dataSources[i];
            if (!_.isNil(dts.NamespacePrefix)) {
              dts.FullName = `${dts.NamespacePrefix}__${dts.DeveloperName}`;
            } else {
              dts.FullName = dts.DeveloperName;
            }
          }
        }
        this.data = dataSources;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getExternalDataSources() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  externalDataSourceExists(dataSource) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (
        !_.isNil(metadataInfo_1.METADATA_INFO.ExternalDataSource.components)
      ) {
        found = metadataInfo_1.METADATA_INFO.ExternalDataSource.components.includes(
          dataSource
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let dataSources = yield this.getExternalDataSources();
        let foundDts = dataSources.find((dts) => {
          return dts.FullName === dataSource;
        });
        found = !_.isNil(foundDts);
      }
      return found;
    });
  }
}
exports.default = ExternalDataSourceRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxEYXRhU291cmNlUmV0cmlldmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvcmV0cmlldmVyL2V4dGVybmFsRGF0YVNvdXJjZVJldHJpZXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwwQ0FBNEI7QUFDNUIsa0RBQWdEO0FBQ2hELG9GQUE0RDtBQUM1RCxxRUFBNkM7QUFFN0MsTUFBTSxLQUFLLEdBQ1QsbUVBQW1FLENBQUM7QUFDdEUsTUFBcUIsMkJBQTRCLFNBQVEsK0JBRXhEO0lBRUMsWUFBMkIsR0FBUTtRQUNqQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRE8sUUFBRyxHQUFILEdBQUcsQ0FBSztRQUVqQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQVE7UUFDaEMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRTtZQUN6QywyQkFBMkIsQ0FBQyxRQUFRLEdBQUcsSUFBSSwyQkFBMkIsQ0FDcEUsR0FBRyxDQUNKLENBQUM7U0FDSDtRQUNELE9BQU8sMkJBQTJCLENBQUMsUUFBUSxDQUFDO0lBQzlDLENBQUM7SUFFWSxVQUFVOzs7Ozs7WUFDckIsSUFDRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNoQjtnQkFDQSxPQUFNLFFBQVEsWUFBQyxLQUFLLEVBQUU7Z0JBQ3RCLElBQUksV0FBVyxHQUFHLE1BQU0sT0FBTSxVQUFVLFdBQUUsQ0FBQztnQkFDM0MsSUFBSSxXQUFXLElBQUksU0FBUyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDM0MsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ2pDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxLQUFLLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQzt5QkFDL0Q7NkJBQU07NEJBQ0wsR0FBRyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO3lCQUNsQztxQkFDRjtpQkFDRjtnQkFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDeEI7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBQ1ksc0JBQXNCOztZQUNqQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQUVZLHdCQUF3QixDQUFDLFVBQWtCOztZQUN0RCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDRCQUFhLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pELEtBQUssR0FBRyw0QkFBYSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDMUU7WUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsdUJBQWEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLDZCQUE2QjtnQkFDN0IsSUFBSSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUN0QyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0tBQUE7Q0FDRjtBQTVERCw4Q0E0REMifQ==
