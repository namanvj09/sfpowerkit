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
const QUERY = "Select Id, Name, NameSpacePrefix From ApexClass ";
class ApexClassRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!ApexClassRetriever.instance) {
      ApexClassRetriever.instance = new ApexClassRetriever(org);
    }
    return ApexClassRetriever.instance;
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
        let classes = yield _super.getObjects.call(this);
        if (classes != undefined && classes.length > 0) {
          for (let i = 0; i < classes.length; i++) {
            let cls = classes[i];
            if (!_.isNil(cls.NamespacePrefix)) {
              cls.FullName = `${cls.NamespacePrefix}__${cls.Name}`;
            } else {
              cls.FullName = cls.Name;
            }
          }
        }
        this.data = classes;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getClasses() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  classExists(cls) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.ApexClass.components)) {
        found = metadataInfo_1.METADATA_INFO.ApexClass.components.includes(cls);
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let classes = yield this.getClasses();
        let foundCls = classes.find((aCls) => {
          return aCls.FullName === cls;
        });
        found = !_.isNil(foundCls);
      }
      return found;
    });
  }
}
exports.default = ApexClassRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBleENsYXNzUmV0cmlldmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvcmV0cmlldmVyL2FwZXhDbGFzc1JldHJpZXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwwQ0FBNEI7QUFDNUIsa0RBQWdEO0FBQ2hELG9GQUE0RDtBQUM1RCxxRUFBNkM7QUFFN0MsTUFBTSxLQUFLLEdBQUcsa0RBQWtELENBQUM7QUFDakUsTUFBcUIsa0JBQW1CLFNBQVEsK0JBRS9DO0lBRUMsWUFBMkIsR0FBUTtRQUNqQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRFEsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUVqQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQVE7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtZQUNoQyxrQkFBa0IsQ0FBQyxRQUFRLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzRDtRQUNELE9BQU8sa0JBQWtCLENBQUMsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFWSxVQUFVOzs7Ozs7WUFDckIsSUFDRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNoQjtnQkFDQSxPQUFNLFFBQVEsWUFBQyxLQUFLLEVBQUU7Z0JBQ3RCLElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTSxVQUFVLFdBQUUsQ0FBQztnQkFDdkMsSUFBSSxPQUFPLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDdkMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ2pDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt5QkFDdEQ7NkJBQU07NEJBQ0wsR0FBRyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3lCQUN6QjtxQkFDRjtpQkFDRjtnQkFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDeEI7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBQ1ksVUFBVTs7WUFDckIsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQUE7SUFFWSxXQUFXLENBQUMsR0FBVzs7WUFDbEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLDZCQUE2QjtZQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw0QkFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDaEQsS0FBSyxHQUFHLDRCQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDMUQ7WUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsdUJBQWEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLDZCQUE2QjtnQkFDN0IsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3RDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDbkMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0NBQ0Y7QUExREQscUNBMERDIn0=
