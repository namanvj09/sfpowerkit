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
const metadataInfo_1 = require("../metadataInfo");
const _ = __importStar(require("lodash"));
const baseMetadataRetriever_1 = __importDefault(
  require("./baseMetadataRetriever")
);
const metadataFiles_1 = __importDefault(require("../metadataFiles"));
const QUERY =
  "Select Id, Name, DeveloperName, SobjectType, NamespacePrefix from RecordType";
class RecordTypeRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!RecordTypeRetriever.instance) {
      RecordTypeRetriever.instance = new RecordTypeRetriever(org);
    }
    return RecordTypeRetriever.instance;
  }
  getObjects() {
    const _super = Object.create(null, {
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      if (
        (this.data === undefined || this.data.length == 0) &&
        !this.dataLoaded
      ) {
        let objects = yield _super.getObjects.call(this);
        if (objects != undefined && objects.length > 0) {
          objects = objects.map((elem) => {
            let namespace = "";
            if (
              elem.NamespacePrefix !== undefined &&
              elem.NamespacePrefix !== "" &&
              elem.NamespacePrefix !== null &&
              elem.NamespacePrefix !== "null"
            ) {
              namespace = elem.NamespacePrefix + "__";
            }
            elem.FullName =
              elem.SobjectType + "." + namespace + elem.DeveloperName;
            if (
              elem.DeveloperName === "PersonAccount" &&
              elem.SobjectType === "Account"
            ) {
              elem.FullName =
                "PersonAccount" + "." + namespace + elem.DeveloperName;
            }
            return elem;
          });
        }
        this.data = objects;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getrecordTypes() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  recordTypeExists(recordType) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.RecordType.components)) {
        found = metadataInfo_1.METADATA_INFO.RecordType.components.includes(
          recordType
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let recordTypes = yield this.getrecordTypes();
        let foundRecordType = recordTypes.find((rt) => {
          return rt.FullName === recordType;
        });
        found = !_.isNil(foundRecordType);
      }
      return found;
    });
  }
}
exports.default = RecordTypeRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVHlwZVJldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci9yZWNvcmRUeXBlUmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLGtEQUFnRDtBQUNoRCwwQ0FBNEI7QUFDNUIsb0ZBQTREO0FBQzVELHFFQUE2QztBQUU3QyxNQUFNLEtBQUssR0FDVCw4RUFBOEUsQ0FBQztBQUVqRixNQUFxQixtQkFBb0IsU0FBUSwrQkFFaEQ7SUFFQyxZQUEyQixHQUFRO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQURjLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFRO1FBQ2hDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUU7WUFDakMsbUJBQW1CLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDN0Q7UUFDRCxPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztJQUN0QyxDQUFDO0lBRVksVUFBVTs7Ozs7WUFDckIsSUFDRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNoQjtnQkFDQSxJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU0sVUFBVSxXQUFFLENBQUM7Z0JBQ3ZDLElBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDOUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDN0IsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO3dCQUNuQixJQUNFLElBQUksQ0FBQyxlQUFlLEtBQUssU0FBUzs0QkFDbEMsSUFBSSxDQUFDLGVBQWUsS0FBSyxFQUFFOzRCQUMzQixJQUFJLENBQUMsZUFBZSxLQUFLLElBQUk7NEJBQzdCLElBQUksQ0FBQyxlQUFlLEtBQUssTUFBTSxFQUMvQjs0QkFDQSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7eUJBQ3pDO3dCQUNELElBQUksQ0FBQyxRQUFROzRCQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO3dCQUMxRCxJQUNFLElBQUksQ0FBQyxhQUFhLEtBQUssZUFBZTs0QkFDdEMsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQzlCOzRCQUNBLElBQUksQ0FBQyxRQUFRO2dDQUNYLGVBQWUsR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7eUJBQzFEO3dCQUNELE9BQU8sSUFBSSxDQUFDO29CQUNkLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2dCQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO2dCQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzthQUN4QjtZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFFWSxjQUFjOztZQUN6QixPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQUVZLGdCQUFnQixDQUFDLFVBQWtCOztZQUM5QyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDRCQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNqRCxLQUFLLEdBQUcsNEJBQWEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNsRTtZQUNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyx1QkFBYSxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsNkJBQTZCO2dCQUM3QixJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUM1QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0tBQUE7Q0FDRjtBQXhFRCxzQ0F3RUMifQ==
