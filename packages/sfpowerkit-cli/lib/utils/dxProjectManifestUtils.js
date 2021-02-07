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
exports.DXProjectManifestUtils = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
class DXProjectManifestUtils {
  constructor(projectFolder) {
    this.projectFolder = projectFolder;
  }
  removePackagesNotInDirectory() {
    //Validate projectJson Path
    let sfdxProjectManifestPath = path.join(
      this.projectFolder,
      "sfdx-project.json"
    );
    if (!fs.existsSync(sfdxProjectManifestPath))
      throw new Error(
        `sfdx-project.json doesn't exist at ${sfdxProjectManifestPath}`
      );
    // Read sfdx-projec.json
    const sfdxProjectManifest = fs.readFileSync(
      sfdxProjectManifestPath,
      "utf8"
    );
    this.sfdxProjectManifestJSON = JSON.parse(sfdxProjectManifest);
    //Filter sfdx-project.json of unwanted directories
    this.sfdxProjectManifestJSON.packageDirectories = this.sfdxProjectManifestJSON.packageDirectories.filter(
      (el) => this.isElementExists(el)
    );
    //write back sfdx-project.json back
    fs.writeJSONSync(sfdxProjectManifestPath, this.sfdxProjectManifestJSON);
  }
  isElementExists(element) {
    return fs.existsSync(path.join(this.projectFolder, element.path));
  }
}
exports.DXProjectManifestUtils = DXProjectManifestUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHhQcm9qZWN0TWFuaWZlc3RVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9keFByb2plY3RNYW5pZmVzdFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBNkI7QUFDN0IsNkNBQStCO0FBRS9CLE1BQWEsc0JBQXNCO0lBR2pDLFlBQTJCLGFBQXFCO1FBQXJCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO0lBQUcsQ0FBQztJQUU3Qyw0QkFBNEI7UUFDakMsMkJBQTJCO1FBQzNCLElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDckMsSUFBSSxDQUFDLGFBQWEsRUFDbEIsbUJBQW1CLENBQ3BCLENBQUM7UUFFRixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztZQUN6QyxNQUFNLElBQUksS0FBSyxDQUNiLHNDQUFzQyx1QkFBdUIsRUFBRSxDQUNoRSxDQUFDO1FBRUosd0JBQXdCO1FBQ3hCLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FDekMsdUJBQXVCLEVBQ3ZCLE1BQU0sQ0FDUCxDQUFDO1FBQ0YsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUUvRCxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQ3RHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FDL0IsQ0FBQztRQUVGLG1DQUFtQztRQUNuQyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFTyxlQUFlLENBQUMsT0FBTztRQUM3QixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDRjtBQXBDRCx3REFvQ0MifQ==
