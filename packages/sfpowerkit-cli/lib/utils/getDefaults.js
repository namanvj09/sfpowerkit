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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class GetDefaults {
  static init() {
    let resourcePath = path.join(
      __dirname,
      "..",
      "..",
      "resources",
      "default-config.json"
    );
    let fileData = fs.readFileSync(resourcePath, "utf8");
    this.defaultConfig = JSON.parse(fileData);
  }
  static getApiVersion() {
    if (!this.defaultConfig) {
      this.init();
    }
    return this.defaultConfig.apiversion;
  }
}
exports.default = GetDefaults;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZ2V0RGVmYXVsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLDJDQUE2QjtBQUU3QixNQUFxQixXQUFXO0lBRXRCLE1BQU0sQ0FBQyxJQUFJO1FBQ2pCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQzFCLFNBQVMsRUFDVCxJQUFJLEVBQ0osSUFBSSxFQUNKLFdBQVcsRUFDWCxxQkFBcUIsQ0FDdEIsQ0FBQztRQUNGLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ00sTUFBTSxDQUFDLGFBQWE7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLENBQUM7Q0FDRjtBQW5CRCw4QkFtQkMifQ==
