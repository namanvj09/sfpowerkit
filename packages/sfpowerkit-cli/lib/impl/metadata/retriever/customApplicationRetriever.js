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
  "Select Id, NamespacePrefix, DeveloperName, Label From CustomApplication ";
class CustomApplicationRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!CustomApplicationRetriever.instance) {
      CustomApplicationRetriever.instance = new CustomApplicationRetriever(org);
    }
    return CustomApplicationRetriever.instance;
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
        let apps = yield _super.getObjects.call(this);
        if (apps != undefined && apps.length > 0) {
          for (let i = 0; i < apps.length; i++) {
            let app = apps[i];
            if (!_.isNil(app.NamespacePrefix)) {
              app.FullName = `${app.NamespacePrefix}__${app.DeveloperName}`;
            } else {
              app.FullName = app.DeveloperName;
            }
          }
        }
        this.data = apps;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getApps() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  appExists(application) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomApplication.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomApplication.components.includes(
          application
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let apps = yield this.getApps();
        let foundApp = apps.find((app) => {
          return app.FullName === application;
        });
        found = !_.isNil(foundApp);
      }
      return found;
    });
  }
}
exports.default = CustomApplicationRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQXBwbGljYXRpb25SZXRyaWV2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9yZXRyaWV2ZXIvY3VzdG9tQXBwbGljYXRpb25SZXRyaWV2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMENBQTRCO0FBQzVCLGtEQUFnRDtBQUNoRCxvRkFBNEQ7QUFFNUQscUVBQTZDO0FBRTdDLE1BQU0sS0FBSyxHQUNULDBFQUEwRSxDQUFDO0FBRTdFLE1BQXFCLDBCQUEyQixTQUFRLCtCQUV2RDtJQUVDLFlBQTJCLEdBQVE7UUFDakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQURRLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFRO1FBQ2hDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUU7WUFDeEMsMEJBQTBCLENBQUMsUUFBUSxHQUFHLElBQUksMEJBQTBCLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDM0U7UUFDRCxPQUFPLDBCQUEwQixDQUFDLFFBQVEsQ0FBQztJQUM3QyxDQUFDO0lBRVksVUFBVTs7Ozs7O1lBQ3JCLElBQ0UsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ2xELENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDaEI7Z0JBQ0EsT0FBTSxRQUFRLFlBQUMsS0FBSyxFQUFFO2dCQUN0QixJQUFJLElBQUksR0FBRyxNQUFNLE9BQU0sVUFBVSxXQUFFLENBQUM7Z0JBQ3BDLElBQUksSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3BDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFOzRCQUNqQyxHQUFHLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLGVBQWUsS0FBSyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7eUJBQy9EOzZCQUFNOzRCQUNMLEdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQzt5QkFDbEM7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ3hCO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25CLENBQUM7S0FBQTtJQUNZLE9BQU87O1lBQ2xCLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0lBRVksU0FBUyxDQUFDLFdBQW1COztZQUN4QyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDRCQUFhLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3hELEtBQUssR0FBRyw0QkFBYSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDMUU7WUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsdUJBQWEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLDZCQUE2QjtnQkFDN0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDL0IsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0NBQ0Y7QUExREQsNkNBMERDIn0=
