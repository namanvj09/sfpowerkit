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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = require("path");
const glob = require("glob");
const sfpowerkit_1 = require("../../sfpowerkit");
const antlr4ts_1 = require("antlr4ts");
const ParseTreeWalker_1 = require("antlr4ts/tree/ParseTreeWalker");
const ApexTypeListener_1 = __importDefault(
  require("./listeners/ApexTypeListener")
);
const apex_parser_1 = require("apex-parser");
class ApexTypeFetcher {
  /**
   * Get Apex type of cls files in a search directory.
   * Sorts files into classes, test classes and interfaces.
   * @param searchDir
   */
  getApexTypeOfClsFiles(searchDir) {
    const apexSortedByType = {
      class: [],
      testClass: [],
      interface: [],
      parseError: [],
    };
    let clsFiles;
    if (fs.existsSync(searchDir)) {
      clsFiles = glob.sync(`**/*.cls`, {
        cwd: searchDir,
        absolute: true,
      });
    } else {
      throw new Error(`Search directory does not exist`);
    }
    for (let clsFile of clsFiles) {
      const clsPath = path.resolve(clsFile);
      let clsPayload = fs.readFileSync(clsPath, "utf8");
      let fileDescriptor = {
        name: path.basename(clsFile, ".cls"),
        filepath: clsFile,
      };
      // Parse cls file
      let compilationUnitContext;
      try {
        let lexer = new apex_parser_1.ApexLexer(
          new apex_parser_1.CaseInsensitiveInputStream(clsPath, clsPayload)
        );
        let tokens = new antlr4ts_1.CommonTokenStream(lexer);
        let parser = new apex_parser_1.ApexParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new apex_parser_1.ThrowingErrorListener());
        compilationUnitContext = parser.compilationUnit();
      } catch (err) {
        sfpowerkit_1.SFPowerkit.log(
          `Failed to parse ${clsFile}. Error occured ${JSON.stringify(err)} `,
          sfpowerkit_1.LoggerLevel.DEBUG
        );
        fileDescriptor["error"] = err;
        apexSortedByType["parseError"].push(fileDescriptor);
        continue;
      }
      let apexTypeListener = new ApexTypeListener_1.default();
      // Walk parse tree to determine Apex type
      ParseTreeWalker_1.ParseTreeWalker.DEFAULT.walk(
        apexTypeListener,
        compilationUnitContext
      );
      let apexType = apexTypeListener.getApexType();
      if (apexType.class) {
        apexSortedByType["class"].push(fileDescriptor);
        if (apexType.testClass) {
          apexSortedByType["testClass"].push(fileDescriptor);
        }
      } else if (apexType.interface) {
        apexSortedByType["interface"].push(fileDescriptor);
      } else {
        fileDescriptor["error"] = {
          message: "Unknown Apex Type",
        };
        apexSortedByType["parseError"].push(fileDescriptor);
      }
    }
    return apexSortedByType;
  }
}
exports.default = ApexTypeFetcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBleFR5cGVGZXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ltcGwvcGFyc2VyL0FwZXhUeXBlRmV0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixpREFBMkQ7QUFFM0QsdUNBQTRDO0FBQzVDLG1FQUFnRTtBQUVoRSxvRkFBNEQ7QUFFNUQsNkNBTXFCO0FBRXJCLE1BQXFCLGVBQWU7SUFDbEM7Ozs7T0FJRztJQUNJLHFCQUFxQixDQUFDLFNBQWlCO1FBQzVDLE1BQU0sZ0JBQWdCLEdBQXFCO1lBQ3pDLEtBQUssRUFBRSxFQUFFO1lBQ1QsU0FBUyxFQUFFLEVBQUU7WUFDYixTQUFTLEVBQUUsRUFBRTtZQUNiLFVBQVUsRUFBRSxFQUFFO1NBQ2YsQ0FBQztRQUVGLElBQUksUUFBa0IsQ0FBQztRQUN2QixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUMvQixHQUFHLEVBQUUsU0FBUztnQkFDZCxRQUFRLEVBQUUsSUFBSTthQUNmLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7U0FDcEQ7UUFFRCxLQUFLLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3JDLElBQUksVUFBVSxHQUFXLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFELElBQUksY0FBYyxHQUFtQjtnQkFDbkMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztnQkFDcEMsUUFBUSxFQUFFLE9BQU87YUFDbEIsQ0FBQztZQUVGLGlCQUFpQjtZQUNqQixJQUFJLHNCQUFzQixDQUFDO1lBQzNCLElBQUk7Z0JBQ0YsSUFBSSxLQUFLLEdBQUcsSUFBSSx1QkFBUyxDQUFDLElBQUksd0NBQTBCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLElBQUksTUFBTSxHQUFzQixJQUFJLDRCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU3RCxJQUFJLE1BQU0sR0FBRyxJQUFJLHdCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUM5QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQ0FBcUIsRUFBRSxDQUFDLENBQUM7Z0JBRXJELHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUNuRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLHVCQUFVLENBQUMsR0FBRyxDQUNaLG1CQUFtQixPQUFPLG1CQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQ25FLHdCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO2dCQUVGLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQzlCLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDcEQsU0FBUzthQUNWO1lBRUQsSUFBSSxnQkFBZ0IsR0FBcUIsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDO1lBRWhFLHlDQUF5QztZQUN6QyxpQ0FBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQzFCLGdCQUFzQyxFQUN0QyxzQkFBc0IsQ0FDdkIsQ0FBQztZQUVGLElBQUksUUFBUSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTlDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtnQkFDbEIsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7b0JBQ3RCLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDcEQ7YUFDRjtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBQzdCLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNwRDtpQkFBTTtnQkFDTCxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUc7b0JBQ3hCLE9BQU8sRUFBRSxtQkFBbUI7aUJBQzdCLENBQUM7Z0JBQ0YsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ3JEO1NBQ0Y7UUFFRCxPQUFPLGdCQUFnQixDQUFDO0lBQzFCLENBQUM7Q0FDRjtBQWpGRCxrQ0FpRkMifQ==
