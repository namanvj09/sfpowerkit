"use strict";
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
exports.SourceDiffGenerator = void 0;
const xml2js = require("xml2js");
const util = require("util");
const nested_object_diff_1 = require("nested-object-diff");
// TODO: extends base class diffGenerator
// diff generators will not only be used for git commits
// compares two entities
class SourceDiffGenerator {
  constructor(baseline, target) {
    this.baseline = baseline;
    this.target = target;
  }
  // compares two entities
  compareRevisions(fileRevFrom, fileRevTo, filepath) {
    return __awaiter(this, void 0, void 0, function* () {
      let diffSummary = {};
      let filepathArray = filepath.split("/");
      let objectName = filepathArray[filepathArray.length - 3];
      let fileObjRevFrom;
      let fileObjRevTo;
      let parser = new xml2js.Parser({ explicitArray: false });
      let parseString = util.promisify(parser.parseString);
      let metadataType;
      let fullName;
      if (fileRevFrom) {
        fileObjRevFrom = yield parseString(fileRevFrom);
        metadataType = Object.keys(fileObjRevFrom)[0];
        fullName = fileObjRevFrom[metadataType]["fullName"];
      }
      if (fileRevTo) {
        fileObjRevTo = yield parseString(fileRevTo);
        metadataType = Object.keys(fileObjRevTo)[0];
        fullName = fileObjRevTo[metadataType]["fullName"];
      }
      if (!fileObjRevFrom && fileObjRevTo) {
        // Created new file
        diffSummary = {
          object: objectName,
          api_name: fullName,
          type: metadataType,
          from: this.baseline,
          to: this.target,
          filepath: filepath,
          diff: [
            {
              operation: "CREATE",
              coordinates: "",
              before: "",
              after: "",
            },
          ],
        };
      } else if (fileObjRevFrom && !fileObjRevTo) {
        // Deleted file
        diffSummary = {
          object: objectName,
          api_name: fullName,
          type: metadataType,
          from: this.baseline,
          to: this.target,
          filepath: filepath,
          diff: [
            {
              operation: "DELETE",
              coordinates: "",
              before: "",
              after: "",
            },
          ],
        };
      } else {
        let changesBetweenRevisions = nested_object_diff_1.diff(
          fileObjRevFrom,
          fileObjRevTo
        );
        let isPicklistValueChanged;
        let isValueSetChanged;
        changesBetweenRevisions = changesBetweenRevisions
          .filter((change) => {
            // Filter out changes to ValueSets & PicklistValues
            if (change["path"].includes("valueSetDefinition")) {
              isValueSetChanged = true;
              return false;
            } else if (change["path"].includes("picklistValues")) {
              isPicklistValueChanged = true;
              return false;
            } else {
              return true;
            }
          })
          .map((change) => {
            // Rename properties
            let operation;
            switch (change["type"]) {
              case "A": {
                operation = "ADD";
                break;
              }
              case "E": {
                operation = "EDIT";
                break;
              }
              case "D": {
                operation = "REMOVE";
                break;
              }
            }
            let root = new RegExp(`^${metadataType}\\.`);
            return {
              operation: operation,
              coordinates: change["path"].replace(root, ""),
              before: change["lhs"],
              after: change["rhs"],
            };
          });
        if (isPicklistValueChanged) {
          changesBetweenRevisions.push({
            operation: "EDIT",
            coordinates: "PicklistValue",
            before: "",
            after: "",
          });
        }
        if (isValueSetChanged) {
          changesBetweenRevisions.push({
            operation: "EDIT",
            coordinates: "ValueSet",
            before: "",
            after: "",
          });
        }
        diffSummary = {
          object: objectName,
          api_name: fullName,
          type: metadataType,
          from: this.baseline,
          to: this.target,
          filepath: filepath,
          diff: changesBetweenRevisions,
        };
      }
      return diffSummary;
    });
  }
}
exports.SourceDiffGenerator = SourceDiffGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlRGlmZkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9pbXBsL3Byb2plY3QvbWV0YWRhdGEvZGlmZmdlbmVyYXRvcnMvc291cmNlRGlmZkdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLDJEQUEwQztBQUUxQyx5Q0FBeUM7QUFDekMsd0RBQXdEO0FBQ3hELHdCQUF3QjtBQUN4QixNQUFhLG1CQUFtQjtJQUM5QixZQUFtQixRQUFnQixFQUFTLE1BQWM7UUFBdkMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQVE7SUFBRyxDQUFDO0lBQzlELHdCQUF3QjtJQUNYLGdCQUFnQixDQUMzQixXQUEwQixFQUMxQixTQUF3QixFQUN4QixRQUFnQjs7WUFFaEIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBRXJCLElBQUksYUFBYSxHQUFhLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsSUFBSSxVQUFVLEdBQVcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFakUsSUFBSSxjQUFjLENBQUM7WUFDbkIsSUFBSSxZQUFZLENBQUM7WUFDakIsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckQsSUFBSSxZQUFZLENBQUM7WUFDakIsSUFBSSxRQUFRLENBQUM7WUFFYixJQUFJLFdBQVcs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
