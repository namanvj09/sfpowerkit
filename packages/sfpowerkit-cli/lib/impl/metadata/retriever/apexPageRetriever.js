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
const QUERY = "Select Id, Name, NameSpacePrefix From ApexPage";
class ApexPageRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!ApexPageRetriever.instance) {
      ApexPageRetriever.instance = new ApexPageRetriever(org);
    }
    return ApexPageRetriever.instance;
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
        let pages = yield _super.getObjects.call(this);
        if (pages != undefined && pages.length > 0) {
          for (let i = 0; i < pages.length; i++) {
            let page = pages[i];
            if (!_.isNil(page.NamespacePrefix)) {
              page.FullName = `${page.NamespacePrefix}__${page.Name}`;
            } else {
              page.FullName = page.Name;
            }
          }
        }
        this.data = pages;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getPages() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  pageExists(page) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.ApexPage.components)) {
        found = metadataInfo_1.METADATA_INFO.ApexPage.components.includes(page);
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let pages = yield this.getPages();
        let foundPage = pages.find((p) => {
          return p.FullName === page;
        });
        found = !_.isNil(foundPage);
      }
      return found;
    });
  }
}
exports.default = ApexPageRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBleFBhZ2VSZXRyaWV2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9yZXRyaWV2ZXIvYXBleFBhZ2VSZXRyaWV2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMENBQTRCO0FBQzVCLGtEQUFnRDtBQUNoRCxvRkFBNEQ7QUFDNUQscUVBQTZDO0FBRTdDLE1BQU0sS0FBSyxHQUFHLGdEQUFnRCxDQUFDO0FBQy9ELE1BQXFCLGlCQUFrQixTQUFRLCtCQUErQjtJQUU1RSxZQUEyQixHQUFRO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEUSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBUTtRQUNoQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFO1lBQy9CLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pEO1FBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUVZLFVBQVU7Ozs7OztZQUNyQixJQUNFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ2hCO2dCQUNBLE9BQU0sUUFBUSxZQUFDLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxLQUFLLEdBQUcsTUFBTSxPQUFNLFVBQVUsV0FBRSxDQUFDO2dCQUNyQyxJQUFJLEtBQUssSUFBSSxTQUFTLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNyQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTs0QkFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO3lCQUN6RDs2QkFBTTs0QkFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7eUJBQzNCO3FCQUNGO2lCQUNGO2dCQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzthQUN4QjtZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFDWSxRQUFROztZQUNuQixPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQUVZLFVBQVUsQ0FBQyxJQUFZOztZQUNsQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDRCQUFhLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMvQyxLQUFLLEdBQUcsNEJBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMxRDtZQUNELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyx1QkFBYSxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsNkJBQTZCO2dCQUM3QixJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUMvQixPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDO2dCQUM3QixDQUFDLENBQUMsQ0FBQztnQkFDSCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0tBQUE7Q0FDRjtBQXhERCxvQ0F3REMifQ==
