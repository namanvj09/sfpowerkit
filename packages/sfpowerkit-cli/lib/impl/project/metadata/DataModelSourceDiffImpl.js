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
Object.defineProperty(exports, "__esModule", { value: true });
const DiffGenerators = __importStar(require("./diffgenerators/export"));
const util_1 = require("util");
// Gets the xml files and passes them into diff generators
// Output : csv or json format
class DataModelSourceDiffImpl {
  constructor(git, baseline, target, packageDirectories) {
    this.git = git;
    this.baseline = baseline;
    this.target = target;
    this.packageDirectories = packageDirectories;
    this.diffGenerators = {
      customfield: DiffGenerators.SourceDiffGenerator,
      recordtype: DiffGenerators.SourceDiffGenerator,
      businessprocess: DiffGenerators.SourceDiffGenerator,
    };
    this.filePattern = {
      customfield: "field",
      recordtype: "recordType",
      businessprocess: "businessProcess",
    };
  }
  exec() {
    return __awaiter(this, void 0, void 0, function* () {
      const sourceDiffResult = [];
      for (let metadataType in this.diffGenerators) {
        let changedFiles = yield this.getNameOfChangedFiles(
          this.git,
          this.baseline,
          this.target,
          metadataType
        );
        if (!util_1.isNullOrUndefined(this.packageDirectories)) {
          changedFiles = this.filterByPackageDirectory(
            changedFiles,
            this.packageDirectories
          );
        }
        let sourceDiffGenerator = new this.diffGenerators[metadataType](
          this.baseline,
          this.target
        );
        for (let file of changedFiles) {
          let fileRevFrom = yield this.git
            .show([`${this.baseline}:${file}`])
            .catch((err) => {});
          let fileRevTo = yield this.git
            .show([`${this.target}:${file}`])
            .catch((err) => {});
          let diff = yield sourceDiffGenerator.compareRevisions(
            fileRevFrom,
            fileRevTo,
            file
          );
          // Aggregate individual file diffs in the source diff result
          if (diff) {
            sourceDiffResult.push(diff);
          }
        }
      }
      return sourceDiffResult;
    });
  }
  getNameOfChangedFiles(git, baseline, target, metadataType) {
    return __awaiter(this, void 0, void 0, function* () {
      let gitDiffResult = yield git.diff([
        baseline,
        target,
        "--name-only",
        "--",
        `**/objects/**/*${this.filePattern[metadataType]}-meta.xml`,
      ]);
      let changedFiles = gitDiffResult.split("\n");
      changedFiles.pop();
      return changedFiles;
    });
  }
  filterByPackageDirectory(changedFiles, packageDirectories) {
    let filteredChangedFiles = changedFiles.filter((file) => {
      let isFileInPackageDir;
      packageDirectories.forEach((dir) => {
        if (file.includes(dir)) isFileInPackageDir = true;
      });
      return isFileInPackageDir;
    });
    return filteredChangedFiles;
  }
}
exports.default = DataModelSourceDiffImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YU1vZGVsU291cmNlRGlmZkltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wcm9qZWN0L21ldGFkYXRhL0RhdGFNb2RlbFNvdXJjZURpZmZJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdFQUEwRDtBQUMxRCwrQkFBeUM7QUFFekMsMERBQTBEO0FBQzFELDhCQUE4QjtBQUM5QixNQUFxQix1QkFBdUI7SUFDMUMsWUFDUyxHQUFHLEVBQ0gsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLGtCQUE0QjtRQUg1QixRQUFHLEdBQUgsR0FBRyxDQUFBO1FBQ0gsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFVO1FBRzdCLG1CQUFjLEdBQUc7WUFDdkIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxtQkFBbUI7WUFDL0MsVUFBVSxFQUFFLGNBQWMsQ0FBQyxtQkFBbUI7WUFDOUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxtQkFBbUI7U0FDcEQsQ0FBQztRQUVNLGdCQUFXLEdBQUc7WUFDcEIsV0FBVyxFQUFFLE9BQU87WUFDcEIsVUFBVSxFQUFFLFlBQVk7WUFDeEIsZUFBZSxFQUFFLGlCQUFpQjtTQUNuQyxDQUFDO0lBWkMsQ0FBQztJQWNTLElBQUk7O1lBQ2YsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFDNUIsS0FBSyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUM1QyxJQUFJLFlBQVksR0FBYSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FDM0QsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxNQUFNLEVBQ1gsWUFBWSxDQUNiLENBQUM7Z0JBRUYsSUFBSSxDQUFDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO29CQUMvQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUMxQyxZQUFZLEVBQ1osSUFBSSxDQUFDLGtCQUFrQixDQUN4QixDQUFDO2lCQUNIO2dCQUVELElBQUksbUJBQW1CLEdBQXVDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FDbkYsWUFBWSxDQUNiLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRTlCLEtBQUssSUFBSSxJQUFJLElBQUksWUFBWSxFQUFFO29CQUM3QixJQUFJLFdBQVcsR0FBa0IsTUFBTSxJQUFJLENBQUMsR0FBRzt5QkFDNUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO29CQUVwQixJQUFJLFNBQVMsR0FBa0IsTUFBTSxJQUFJLENBQUMsR0FBRzt5QkFDMUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO29CQUVwQixJQUFJLElBQUksR0FBRyxNQUFNLG1CQUFtQixDQUFDLGdCQUFnQixDQUNuRCxXQUFXLEVBQ1gsU0FBUyxFQUNULElBQUksQ0FDTCxDQUFDO29CQUVGLDREQUE0RDtvQkFDNUQsSUFBSSxJQUFJLEVBQUU7d0JBQ1IsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUM3QjtpQkFDRjthQUNGO1lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztRQUMxQixDQUFDO0tBQUE7SUFFYSxxQkFBcUIsQ0FDakMsR0FBRyxFQUNILFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxZQUFvQjs7WUFFcEIsSUFBSSxhQUFhLEdBQVcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUN6QyxRQUFRO2dCQUNSLE1BQU07Z0JBQ04sYUFBYTtnQkFDYixJQUFJO2dCQUNKLGtCQUFrQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxXQUFXO2FBQzVELENBQUMsQ0FBQztZQUVILElBQUksWUFBWSxHQUFhLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkQsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRW5CLE9BQU8sWUFBWSxDQUFDO1FBQ3RCLENBQUM7S0FBQTtJQUVPLHdCQUF3QixDQUM5QixZQUFzQixFQUN0QixrQkFBNEI7UUFFNUIsSUFBSSxvQkFBb0IsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BELElBQUksa0JBQWtCLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO29CQUFFLGtCQUFrQixHQUFHLElBQUksQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sa0JBQWtCLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLG9CQUFvQixDQUFDO0lBQzlCLENBQUM7Q0FDRjtBQW5HRCwwQ0FtR0MifQ==
