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
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../sfpowerkit");
const fs = __importStar(require("fs-extra"));
const fileutils_1 = __importDefault(require("./fileutils"));
class OutputGenerator {
  generateJsonOutput(result, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let outputJsonPath = `${outputDir}/output.json`;
      let dir = path.parse(outputJsonPath).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      fs.writeFileSync(outputJsonPath, JSON.stringify(result));
      sfpowerkit_1.SFPowerkit.log(
        `Output ${outputDir}/output.json is generated successfully`,
        sfpowerkit_1.LoggerLevel.INFO
      );
    });
  }
  generateCSVOutput(result, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let outputcsvPath = `${outputDir}/output.csv`;
      let dir = path.parse(outputcsvPath).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      fs.writeFileSync(outputcsvPath, result);
      sfpowerkit_1.SFPowerkit.log(
        `Output ${outputDir}/output.csv is generated successfully`,
        sfpowerkit_1.LoggerLevel.INFO
      );
    });
  }
}
exports.default = OutputGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0R2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL291dHB1dEdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBNkI7QUFDN0IsOENBQXdEO0FBQ3hELDZDQUErQjtBQUMvQiw0REFBb0M7QUFFcEMsTUFBcUIsZUFBZTtJQUNyQixrQkFBa0IsQ0FBQyxNQUFXLEVBQUUsU0FBaUI7O1lBQzVELElBQUksY0FBYyxHQUFHLEdBQUcsU0FBUyxjQUFjLENBQUM7WUFDaEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLG1CQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pELHVCQUFVLENBQUMsR0FBRyxDQUNaLFVBQVUsU0FBUyx3Q0FBd0MsRUFDM0Qsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7UUFDSixDQUFDO0tBQUE7SUFFWSxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsU0FBaUI7O1lBQzlELElBQUksYUFBYSxHQUFHLEdBQUcsU0FBUyxhQUFhLENBQUM7WUFDOUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFFeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLG1CQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1lBRUQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEMsdUJBQVUsQ0FBQyxHQUFHLENBQ1osVUFBVSxTQUFTLHVDQUF1QyxFQUMxRCx3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNGO0FBNUJELGtDQTRCQyJ9
