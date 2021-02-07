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
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const dependencyImpl_1 = __importDefault(
  require("../../../../impl/dependency/dependencyImpl")
);
const metadataSummaryInfoFetcher_1 = __importDefault(
  require("../../../../impl/metadata/retriever/metadataSummaryInfoFetcher")
);
const path = __importStar(require("path"));
const sfpowerkit_1 = require("../../../../sfpowerkit");
const fs = __importStar(require("fs-extra"));
const fileutils_1 = __importDefault(require("../../../../utils/fileutils"));
const rimraf = __importStar(require("rimraf"));
const getDefaults_1 = __importDefault(require("../../../../utils/getDefaults"));
const progressBar_1 = require("../../../../ui/progressBar");
const PackageInfo_1 = __importDefault(
  require("@dxatscale/sfpowerkit.core/lib/package/version/PackageInfo")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "dependency_tree_package"
);
class Tree extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      this.conn = this.org.getConnection();
      this.output = [];
      //Fetch Package Details from an Org
      try {
        let packageDetails = yield new PackageInfo_1.default(
          this.conn,
          getDefaults_1.default.getApiVersion()
        ).getPackages();
        this.installedPackagesMap = new Map(
          packageDetails.map((obj) => [obj.subcriberPackageId, obj])
        );
      } catch (error) {
        throw new core_1.SfdxError(
          "Unable to retrieve details about packages in the org"
        );
      }
      //Find Requested Package
      let requestPackage;
      for (let pkg of this.installedPackagesMap.values()) {
        if (
          pkg.subcriberPackageId === this.flags.package ||
          pkg.packageName === this.flags.package ||
          pkg.packageVersionId === this.flags.package
        ) {
          requestPackage = pkg;
          break;
        }
      }
      sfpowerkit_1.SFPowerkit.log(
        "Requested Package Info:" + JSON.stringify(requestPackage),
        sfpowerkit_1.LoggerLevel.TRACE
      );
      if (!requestPackage) {
        throw new core_1.SfdxError(
          `Unable to find the package ${
            this.flags.package
          } in ${this.org.getUsername()} org.`
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        `Fetching all components details of ${requestPackage.packageName} package from the org`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let packageMembers = yield dependencyImpl_1.default.getMemberFromPackage(
        this.conn,
        requestPackage.subcriberPackageId
      );
      sfpowerkit_1.SFPowerkit.log(
        "Package Member Info:" + JSON.stringify(packageMembers),
        sfpowerkit_1.LoggerLevel.TRACE
      );
      sfpowerkit_1.SFPowerkit.log(
        `Found ${packageMembers.length} components from ${requestPackage.packageName} package`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let dependencyResult = yield dependencyImpl_1.default.getDependencyMapById(
        this.conn,
        packageMembers
      );
      this.dependencyMap = dependencyResult.dependencyMap;
      this.metadataMap = dependencyResult.dependencyDetailsMap;
      sfpowerkit_1.SFPowerkit.log(
        `Found ${this.dependencyMap.size} components having dependency`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let result = yield metadataSummaryInfoFetcher_1.default.fetchMetadataSummaryFromAnOrg(
        this.conn
      );
      for (let metaObj of result.keys())
        this.metadataMap.set(metaObj, result.get(metaObj));
      let membersWithoutDependency = packageMembers.filter(
        (x) => !Array.from(this.dependencyMap.keys()).includes(x)
      );
      yield this.getDetailsFromId(
        this.flags.packagefilter,
        membersWithoutDependency
      );
      if (this.flags.format === "json") {
        yield this.generateJsonOutput(this.output, this.flags.output);
      } else {
        yield this.generateCSVOutput(this.output, this.flags.output);
      }
      return this.output;
    });
  }
  getDetailsFromId(packagefilter, membersWithoutDependency) {
    return __awaiter(this, void 0, void 0, function* () {
      let pkgMemberMap = yield dependencyImpl_1.default.getMemberVsPackageMap(
        this.conn
      );
      let result = [];
      let progressBar = new progressBar_1.ProgressBar().create(
        `Computing the dependency tree`,
        ` items`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      progressBar.start(
        this.flags.showall
          ? this.dependencyMap.size + membersWithoutDependency.length
          : this.dependencyMap.size
      );
      //items having dependency
      for (let member of this.dependencyMap.keys()) {
        let currentItem = JSON.parse(
          JSON.stringify(
            this.metadataMap.has(member)
              ? this.metadataMap.get(member)
              : { id: member, fullName: "unknown", type: "unknown" }
          )
        );
        if (!packagefilter) {
          currentItem.dependentMetadata = [];
        } else {
          currentItem.dependentPackage = [];
        }
        for (let dependent of this.dependencyMap.get(member)) {
          let dependentItem = JSON.parse(
            JSON.stringify(
              this.metadataMap.has(dependent)
                ? this.metadataMap.get(dependent)
                : { id: dependent, fullName: "unknown", type: "unknown" }
            )
          );
          dependentItem.package = pkgMemberMap.has(dependent)
            ? this.installedPackagesMap.get(pkgMemberMap.get(dependent))
                .packageName
            : "Org";
          if (
            packagefilter &&
            !currentItem.dependentPackage.includes(dependentItem.package)
          ) {
            currentItem.dependentPackage.push(dependentItem.package);
          }
          if (!packagefilter) {
            currentItem.dependentMetadata.push(dependentItem);
          }
        }
        progressBar.increment(1);
        result.push(currentItem);
      }
      if (this.flags.showall) {
        //items with dependency
        membersWithoutDependency.forEach((member) => {
          let currentItem = JSON.parse(
            JSON.stringify(
              this.metadataMap.has(member)
                ? this.metadataMap.get(member)
                : { id: member, fullName: "unknown", type: "unknown" }
            )
          );
          if (!packagefilter) {
            currentItem.dependentMetadata = [];
          } else {
            currentItem.dependentPackage = [];
          }
          progressBar.increment(1);
          result.push(currentItem);
        });
      }
      progressBar.stop();
      this.output = result;
    });
  }
  generateJsonOutput(result, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let outputJsonPath = `${outputDir}/output.json`;
      rimraf.sync(outputJsonPath);
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
      let newLine = "\r\n";
      let output =
        "ID,NAME,TYPE," +
        (this.flags.packagefilter
          ? "DEPENDENT PACKAGE"
          : "DEPENDENT ID,DEPENDENT NAME,DEPENDENT TYPE,DEPENDENT PACKAGE") +
        newLine;
      result.forEach((element) => {
        if (element.dependentMetadata && element.dependentMetadata.length > 0) {
          for (let dependent of element.dependentMetadata) {
            output = `${output}${element.id},${element.fullName},${element.type},${dependent.id},${dependent.fullName},${dependent.type},${dependent.package}${newLine}`;
          }
        } else if (
          element.dependentPackage &&
          element.dependentPackage.length > 0
        ) {
          for (let dependent of element.dependentPackage) {
            output = `${output}${element.id},${element.fullName},${element.type},${dependent}${newLine}`;
          }
        } else {
          output = `${output}${element.id},${element.fullName},${element.type}${newLine}`;
        }
      });
      fs.writeFileSync(outputcsvPath, output);
      sfpowerkit_1.SFPowerkit.log(
        `Output ${outputDir}/output.csv is generated successfully`,
        sfpowerkit_1.LoggerLevel.INFO
      );
    });
  }
}
exports.default = Tree;
Tree.description = messages.getMessage("commandDescription");
Tree.examples = [
  "$ sfdx sfpowerkit:dependency:tree:package -u MyScratchOrg -n 04txxxxxxxxxx -o outputdir -f json",
  "$ sfdx sfpowerkit:dependency:tree:package -u MyScratchOrg -n 04txxxxxxxxxx -o outputdir -f csv",
  "$ sfdx sfpowerkit:dependency:tree:package -u MyScratchOrg -n 04txxxxxxxxxx -o outputdir -f csv -p",
  "$ sfdx sfpowerkit:dependency:tree:package -u MyScratchOrg -n 04txxxxxxxxxx -o outputdir -f csv -s",
];
Tree.flagsConfig = {
  package: command_1.flags.string({
    char: "n",
    required: true,
    description: messages.getMessage("packageDescription"),
  }),
  packagefilter: command_1.flags.boolean({
    description: messages.getMessage("packagefilterDescription"),
    char: "p",
    required: false,
  }),
  showall: command_1.flags.boolean({
    char: "s",
    description: messages.getMessage("showallDescription"),
    required: false,
  }),
  format: command_1.flags.enum({
    required: false,
    char: "f",
    description: messages.getMessage("formatDescription"),
    options: ["json", "csv"],
    default: "json",
  }),
  output: command_1.flags.string({
    char: "o",
    description: messages.getMessage("outputDescription"),
    required: true,
  }),
  loglevel: command_1.flags.enum({
    description: messages.getMessage("loglevelDescription"),
    default: "info",
    required: false,
    options: [
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
      "TRACE",
      "DEBUG",
      "INFO",
      "WARN",
      "ERROR",
      "FATAL",
    ],
  }),
};
// Comment this out if your command does not require an org username
Tree.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L2RlcGVuZGVuY3kvdHJlZS9wYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUErRDtBQUMvRCwyQ0FBeUQ7QUFFekQsZ0dBQXdFO0FBQ3hFLGdJQUV3RTtBQUN4RSwyQ0FBNkI7QUFDN0IsdURBQWlFO0FBQ2pFLDZDQUErQjtBQUMvQiw0RUFBb0Q7QUFDcEQsK0NBQWlDO0FBQ2pDLGdGQUF3RDtBQUN4RCw0REFBeUQ7QUFDekQsNkdBQXFHO0FBSXJHLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3pDLFlBQVksRUFDWix5QkFBeUIsQ0FDMUIsQ0FBQztBQUVGLE1BQXFCLElBQUssU0FBUSxxQkFBVztJQW1FOUIsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVqQixtQ0FBbUM7WUFDbkMsSUFBSTtnQkFDRixJQUFJLGNBQWMsR0FBb0IsTUFBTSxJQUFJLHFCQUFXLENBQ3pELElBQUksQ0FBQyxJQUFJLEVBQ1QscUJBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FDNUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFaEIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksR0FBRyxDQUNqQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FDekQsQ0FBQzthQUNIO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLGdCQUFTLENBQ2pCLHNEQUFzRCxDQUN2RCxDQUFDO2FBQ0g7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxjQUE2QixDQUFDO1lBQ2xDLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNsRCxJQUNFLEdBQUcsQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87b0JBQzdDLEdBQUcsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO29CQUN0QyxHQUFHLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQzNDO29CQUNBLGNBQWMsR0FBRyxHQUFHLENBQUM7b0JBQ3JCLE1BQU07aUJBQ1A7YUFDRjtZQUVELHVCQUFVLENBQUMsR0FBRyxDQUNaLHlCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQzFELHdCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO1lBRUYsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLGdCQUFTLENBQ2pCLDhCQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FDYixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FDckMsQ0FBQzthQUNIO1lBRUQsdUJBQVUsQ0FBQyxHQUFHLENBQ1osc0NBQXNDLGNBQWMsQ0FBQyxXQUFXLHVCQUF1QixFQUN2Rix3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztZQUVGLElBQUksY0FBYyxHQUFhLE1BQU0sd0JBQWMsQ0FBQyxvQkFBb0IsQ0FDdEUsSUFBSSxDQUFDLElBQUksRUFDVCxjQUFjLENBQUMsa0JBQWtCLENBQ2xDLENBQUM7WUFFRix1QkFBVSxDQUFDLEdBQUcsQ0FDWixzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUN2RCx3QkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztZQUVGLHVCQUFVLENBQUMsR0FBRyxDQUNaLFNBQVMsY0FBYyxDQUFDLE1BQU0sb0JBQW9CLGNBQWMsQ0FBQyxXQUFXLFVBQVUsRUFDdEYsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFFRixJQUFJLGdCQUFnQixHQUFHLE1BQU0sd0JBQWMsQ0FBQyxvQkFBb0IsQ0FDOUQsSUFBSSxDQUFDLElBQUksRUFDVCxjQUFjLENBQ2YsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO1lBQ3BELElBQUksQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUM7WUFFekQsdUJBQVUsQ0FBQyxHQUFHLENBQ1osU0FBUyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksK0JBQStCLEVBQy9ELHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO1lBRUYsSUFBSSxNQUFNLEdBQUcsTUFBTSxvQ0FBMEIsQ0FBQyw2QkFBNkIsQ0FDekUsSUFBSSxDQUFDLElBQUksQ0FDVixDQUFDO1lBRUYsS0FBSyxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRXJELElBQUksd0JBQXdCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FDbEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDeEQsQ0FBQztZQUNGLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFDeEIsd0JBQXdCLENBQ3pCLENBQUM7WUFDRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDaEMsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9EO2lCQUFNO2dCQUNMLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM5RDtZQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQixDQUFDO0tBQUE7SUFFYSxnQkFBZ0IsQ0FDNUIsYUFBc0IsRUFDdEIsd0JBQWtDOztZQUVsQyxJQUFJLFlBQVksR0FHWixNQUFNLHdCQUFjLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVoQixJQUFJLFdBQVcsR0FBRyxJQUFJLHlCQUFXLEVBQUUsQ0FBQyxNQUFNLENBQ3hDLCtCQUErQixFQUMvQixRQUFRLEVBQ1Isd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFFRixXQUFXLENBQUMsS0FBSyxDQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTztnQkFDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDLE1BQU07Z0JBQzNELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDNUIsQ0FBQztZQUNGLHlCQUF5QjtZQUN6QixLQUFLLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzVDLElBQUksV0FBVyxHQUFRLElBQUksQ0FBQyxLQUFLLENBQy9CLElBQUksQ0FBQyxTQUFTLENBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO29CQUMxQixDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO29CQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUN6RCxDQUNGLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbEIsV0FBVyxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztpQkFDcEM7cUJBQU07b0JBQ0wsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztpQkFDbkM7Z0JBRUQsS0FBSyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEQsSUFBSSxhQUFhLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FDakMsSUFBSSxDQUFDLFNBQVMsQ0FDWixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7d0JBQ2pDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQzVELENBQ0YsQ0FBQztvQkFFRixhQUFhLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO3dCQUNqRCxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzZCQUN2RCxXQUFXO3dCQUNoQixDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNWLElBQ0UsYUFBYTt3QkFDYixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUM3RDt3QkFDQSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDMUQ7b0JBQ0QsSUFBSSxDQUFDLGFBQWEsRUFBRTt3QkFDbEIsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDbkQ7aUJBQ0Y7Z0JBQ0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMxQjtZQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RCLHVCQUF1QjtnQkFDdkIsd0JBQXdCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN4QyxJQUFJLFdBQVcsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUMvQixJQUFJLENBQUMsU0FBUyxDQUNaLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQzt3QkFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQzt3QkFDOUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FDekQsQ0FDRixDQUFDO29CQUNGLElBQUksQ0FBQyxhQUFhLEVBQUU7d0JBQ2xCLFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNMLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7cUJBQ25DO29CQUNELFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRWEsa0JBQWtCLENBQUMsTUFBYSxFQUFFLFNBQWlCOztZQUMvRCxJQUFJLGNBQWMsR0FBRyxHQUFHLFNBQVMsY0FBYyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLG1CQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pELHVCQUFVLENBQUMsR0FBRyxDQUNaLFVBQVUsU0FBUyx3Q0FBd0MsRUFDM0Qsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7UUFDSixDQUFDO0tBQUE7SUFDWSxpQkFBaUIsQ0FBQyxNQUFhLEVBQUUsU0FBaUI7O1lBQzdELElBQUksYUFBYSxHQUFHLEdBQUcsU0FBUyxhQUFhLENBQUM7WUFDOUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLG1CQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksTUFBTSxHQUNSLGVBQWU7Z0JBQ2YsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWE7b0JBQ3ZCLENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3JCLENBQUMsQ0FBQyw4REFBOEQsQ0FBQztnQkFDbkUsT0FBTyxDQUFDO1lBQ1YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxPQUFPLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3JFLEtBQUssSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO3dCQUMvQyxNQUFNLEdBQUcsR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLEVBQUUsSUFBSSxTQUFTLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLEVBQUUsQ0FBQztxQkFDOUo7aUJBQ0Y7cUJBQU0sSUFDTCxPQUFPLENBQUMsZ0JBQWdCO29CQUN4QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbkM7b0JBQ0EsS0FBSyxJQUFJLFNBQVMsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7d0JBQzlDLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxTQUFTLEdBQUcsT0FBTyxFQUFFLENBQUM7cUJBQzlGO2lCQUNGO3FCQUFNO29CQUNMLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLEVBQUUsQ0FBQztpQkFDakY7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLHVCQUFVLENBQUMsR0FBRyxDQUNaLFVBQVUsU0FBUyx1Q0FBdUMsRUFDMUQsd0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7UUFDSixDQUFDO0tBQUE7O0FBaFRILHVCQWlUQztBQWhUZSxnQkFBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV4RCxhQUFRLEdBQUc7SUFDdkIsaUdBQWlHO0lBQ2pHLGdHQUFnRztJQUNoRyxtR0FBbUc7SUFDbkcsbUdBQW1HO0NBQ3BHLENBQUM7QUFFZSxnQkFBVyxHQUFHO0lBQzdCLE9BQU8sRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3BCLElBQUksRUFBRSxHQUFHO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztLQUN2RCxDQUFDO0lBQ0YsYUFBYSxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDM0IsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQUM7UUFDNUQsSUFBSSxFQUFFLEdBQUc7UUFDVCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsT0FBTyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztRQUN0RCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBQ0YsTUFBTSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDakIsUUFBUSxFQUFFLEtBQUs7UUFDZixJQUFJLEVBQUUsR0FBRztRQUNULFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDO1FBQ3JELE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDeEIsT0FBTyxFQUFFLE1BQU07S0FDaEIsQ0FBQztJQUNGLE1BQU0sRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ25CLElBQUksRUFBRSxHQUFHO1FBQ1QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7UUFDckQsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDO0lBQ0YsUUFBUSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUM7UUFDdkQsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRTtZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0YsQ0FBQztDQUNILENBQUM7QUFFRixvRUFBb0U7QUFDbkQscUJBQWdCLEdBQUcsSUFBSSxDQUFDIn0=
