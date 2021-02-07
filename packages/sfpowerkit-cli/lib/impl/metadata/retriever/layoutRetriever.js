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
  "SELECT Id, Name, EntityDefinition.QualifiedApiName, EntityDefinitionId, NamespacePrefix From Layout  ";
class LayoutRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!LayoutRetriever.instance) {
      LayoutRetriever.instance = new LayoutRetriever(org);
    }
    return LayoutRetriever.instance;
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
        let layouts = yield _super.getObjects.call(this);
        if (layouts != undefined && layouts.length > 0) {
          for (let i = 0; i < layouts.length; i++) {
            let namespace = "";
            if (
              layouts[i].NamespacePrefix !== undefined &&
              layouts[i].NamespacePrefix !== "" &&
              layouts[i].NamespacePrefix !== null &&
              layouts[i].NamespacePrefix !== "null"
            ) {
              namespace = layouts[i].NamespacePrefix + "__";
            }
            if (
              layouts[i].EntityDefinition !== null &&
              layouts[i].EntityDefinition !== undefined
            ) {
              layouts[i].FullName =
                layouts[i].EntityDefinition.QualifiedApiName +
                "-" +
                namespace +
                layouts[i].Name.replace(/%/g, "%25")
                  .replace(/\//g, "%2F")
                  .replace(new RegExp(/\\/, "g"), "%5C")
                  .replace(/\(/g, "%28")
                  .replace(/\)/g, "%29")
                  .replace(/#/g, "%23")
                  .replace(/\$/g, "%24")
                  .replace(/&/g, "%26")
                  .replace(/~/g, "%7E")
                  .replace(/\[/g, "%5B")
                  .replace(/\]/g, "%5D")
                  .replace(/\^/g, "%5E")
                  .replace(/\{/g, "%7B")
                  .replace(/\}/g, "%7D")
                  .replace(/\|/g, "%7C")
                  .replace(/@/g, "%40")
                  .replace(/'/g, "%27");
            } else {
              layouts[i].FullName =
                layouts[i].EntityDefinitionId +
                "-" +
                namespace +
                layouts[i].Name.replace(/%/g, "%25")
                  .replace(/\//g, "%2F")
                  .replace(new RegExp(/\\/, "g"), "%5C")
                  .replace(/\(/g, "%28")
                  .replace(/\)/g, "%29")
                  .replace(/#/g, "%23")
                  .replace(/\$/g, "%24")
                  .replace(/&/g, "%26")
                  .replace(/~/g, "%7E")
                  .replace(/\[/g, "%5B")
                  .replace(/\]/g, "%5D")
                  .replace(/\^/g, "%5E")
                  .replace(/\{/g, "%7B")
                  .replace(/\}/g, "%7D")
                  .replace(/\|/g, "%7C")
                  .replace(/@/g, "%40")
                  .replace(/'/g, "%27");
            }
          }
        }
        this.data = layouts;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getLayouts() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  layoutExists(layout) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.Layout.components)) {
        found = metadataInfo_1.METADATA_INFO.Layout.components.includes(layout);
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let layouts = yield this.getLayouts();
        let foundLayout = layouts.find((l) => {
          return l.FullName === layout;
        });
        found = !_.isNil(foundLayout);
      }
      return found;
    });
  }
}
exports.default = LayoutRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0UmV0cmlldmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvcmV0cmlldmVyL2xheW91dFJldHJpZXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxrREFBZ0Q7QUFDaEQsMENBQTRCO0FBQzVCLG9GQUE0RDtBQUM1RCxxRUFBNkM7QUFFN0MsTUFBTSxLQUFLLEdBQ1QsdUdBQXVHLENBQUM7QUFFMUcsTUFBcUIsZUFBZ0IsU0FBUSwrQkFBNkI7SUFFeEUsWUFBMkIsR0FBUTtRQUNqQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRFEsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUVqQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQVE7UUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUU7WUFDN0IsZUFBZSxDQUFDLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyRDtRQUNELE9BQU8sZUFBZSxDQUFDLFFBQVEsQ0FBQztJQUNsQyxDQUFDO0lBRVksVUFBVTs7Ozs7O1lBQ3JCLElBQ0UsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ2xELENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDaEI7Z0JBQ0EsT0FBTSxRQUFRLFlBQUMsS0FBSyxFQUFFO2dCQUN0QixJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU0sVUFBVSxXQUFFLENBQUM7Z0JBQ3ZDLElBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDOUMsS0FBSyxJQUFJLENBQUMs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
