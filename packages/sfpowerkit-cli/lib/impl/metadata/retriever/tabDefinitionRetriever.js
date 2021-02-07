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
  "SELECT Id,  Name, SobjectName, DurableId, IsCustom, Label FROM TabDefinition ";
class TabDefinitionRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!TabDefinitionRetriever.instance) {
      TabDefinitionRetriever.instance = new TabDefinitionRetriever(org);
    }
    return TabDefinitionRetriever.instance;
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
        let tabs = yield _super.getObjects.call(this);
        this.data = tabs;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getTabs() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  tabExists(tab) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomTab.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomTab.components.includes(tab);
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let tabs = yield this.getTabs();
        let foundTab = tabs.find((t) => {
          return t.Name === tab;
        });
        found = !_.isNil(foundTab);
      }
      return found;
    });
  }
}
exports.default = TabDefinitionRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiRGVmaW5pdGlvblJldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci90YWJEZWZpbml0aW9uUmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGtEQUFnRDtBQUNoRCwwQ0FBNEI7QUFDNUIsb0ZBQTREO0FBRTVELHFFQUE2QztBQUU3QyxNQUFNLEtBQUssR0FDVCwrRUFBK0UsQ0FBQztBQUNsRixNQUFxQixzQkFBdUIsU0FBUSwrQkFFbkQ7SUFFQyxZQUEyQixHQUFRO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEUSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBUTtRQUNoQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFO1lBQ3BDLHNCQUFzQixDQUFDLFFBQVEsR0FBRyxJQUFJLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxRQUFRLENBQUM7SUFDekMsQ0FBQztJQUVZLFVBQVU7Ozs7OztZQUNyQixJQUNFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ2hCO2dCQUNBLE9BQU0sUUFBUSxZQUFDLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxJQUFJLEdBQUcsTUFBTSxPQUFNLFVBQVUsV0FBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDeEI7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBQ1ksT0FBTzs7WUFDbEIsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQUE7SUFDWSxTQUFTLENBQUMsR0FBVzs7WUFDaEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLDZCQUE2QjtZQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw0QkFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDaEQsS0FBSyxHQUFHLDRCQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDMUQ7WUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsdUJBQWEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLDZCQUE2QjtnQkFDN0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzNCLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO2dCQUNILEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7S0FBQTtDQUNGO0FBL0NELHlDQStDQyJ9
