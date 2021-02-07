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
const command_1 = require("@salesforce/command");
const fs = __importStar(require("fs-extra"));
const packageIdPrefix = "0Ho";
const packageVersionIdPrefix = "04t";
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "dependency_versionlist"
);
class List extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      const conn = this.hubOrg.getConnection();
      let projectConfig = JSON.parse(
        fs.readFileSync("sfdx-project.json", "utf8")
      );
      let filterpaths = [];
      if (this.flags.filterpaths) {
        this.flags.filterpaths.forEach((path) => {
          filterpaths.push(path.split("\\").join("/"));
        });
      }
      for (let packageDirectory of projectConfig.packageDirectories) {
        if (
          filterpaths.length == 0 ||
          filterpaths.includes(packageDirectory.path)
        ) {
          if (
            packageDirectory.dependencies &&
            packageDirectory.dependencies[0] !== undefined
          ) {
            this.ux.log(
              `Package dependencies for the given package directory ${packageDirectory.path}`
            );
            for (let dependency of packageDirectory.dependencies) {
              if (
                projectConfig.packageAliases[dependency.package] !== "undefined"
              ) {
                yield this.getPackageVersionDetails(
                  conn,
                  dependency,
                  projectConfig.packageAliases
                );
                this.ux.log(
                  `    ${dependency.versionId} : ${dependency.package}${
                    dependency.versionNumber === undefined
                      ? ""
                      : " " + dependency.versionNumber
                  }`
                );
              }
            }
          } else {
            this.ux.log(
              `\nNo dependencies found for package directory ${packageDirectory.path}`
            );
          }
        }
      }
      if (this.flags.updateproject) {
        fs.writeFileSync(
          "sfdx-project.json",
          JSON.stringify(
            projectConfig,
            (key, value) => {
              if (key == "versionId") return undefined;
              else return value;
            },
            2
          )
        );
      }
      return projectConfig;
    });
  }
  getPackageVersionDetails(conn, dependency, packageAliases) {
    return __awaiter(this, void 0, void 0, function* () {
      let packageId = packageAliases[dependency.package];
      if (packageId.startsWith(packageVersionIdPrefix)) {
        // Package2VersionId is set directly
        dependency["versionId"] = packageId;
      } else if (packageId.startsWith(packageIdPrefix)) {
        if (!dependency.versionNumber) {
          throw new command_1.core.SfdxError(
            `version number is mandatory for ${dependency.package}`
          );
        }
        // Get Package version id from package + versionNumber
        const vers = dependency.versionNumber.split(".");
        let query =
          "Select SubscriberPackageVersionId, IsPasswordProtected, IsReleased, MajorVersion, MinorVersion, PatchVersion,BuildNumber ";
        query += "from Package2Version ";
        query += `where Package2Id='${packageId}' and MajorVersion=${vers[0]} and MinorVersion=${vers[1]} and PatchVersion=${vers[2]} `;
        // If Build Number isn't set to LATEST, look for the exact Package Version
        if (vers[3] !== "LATEST") {
          query += `and BuildNumber=${vers[3]} `;
        } else if (this.flags.usedependencyvalidatedpackages) {
          query += `and ValidationSkipped = false `;
        }
        query += "ORDER BY BuildNumber DESC, createddate DESC Limit 1";
        // Query DevHub to get the expected Package2Version
        const resultPackageId = yield conn.tooling.query(query);
        if (resultPackageId.size === 0) {
          // Query returned no result
          const errorMessage = `Unable to find package ${
            dependency.package
          } of version ${
            dependency.versionNumber
          } in devhub ${this.hubOrg.getUsername()}. Are you sure it is created yet?`;
          throw new command_1.core.SfdxError(errorMessage);
        } else {
          let versionId = resultPackageId.records[0].SubscriberPackageVersionId;
          let versionNumber = `${resultPackageId.records[0].MajorVersion}.${resultPackageId.records[0].MinorVersion}.${resultPackageId.records[0].PatchVersion}.${resultPackageId.records[0].BuildNumber}`;
          dependency["versionId"] = versionId;
          dependency["versionNumber"] = versionNumber;
        }
      }
    });
  }
}
exports.default = List;
List.description = messages.getMessage("commandDescription");
List.examples = [
  "$ sfdx sfpowerkit:package:dependencies:list -v MyDevHub -s src/dreamhouse",
  "$ sfdx sfpowerkit:package:dependencies:list -v MyDevHub --updateproject",
  "$ sfdx sfpowerkit:package:dependencies:list -v MyDevHub -s --usedependencyvalidatedpackages",
];
List.flagsConfig = {
  filterpaths: command_1.flags.array({
    char: "p",
    required: false,
    description: messages.getMessage("filterpathsDescription"),
  }),
  updateproject: command_1.flags.boolean({
    char: "w",
    required: false,
    description: messages.getMessage("updateprojectDescription"),
  }),
  usedependencyvalidatedpackages: command_1.flags.boolean({
    required: false,
    description: messages.getMessage(
      "usedependencyvalidatedpackagesDescription"
    ),
  }),
};
// Comment this out if your command does not require a hub org username
List.requiresDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
List.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3BhY2thZ2UvZGVwZW5kZW5jaWVzL2xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQStEO0FBRS9ELDZDQUErQjtBQUUvQixNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFFckMsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLHdCQUF3QixDQUN6QixDQUFDO0FBRUYsTUFBcUIsSUFBSyxTQUFRLHFCQUFXO0lBa0M5QixHQUFHOztZQUNkLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDNUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FDN0MsQ0FBQztZQUVGLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNyQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO2dCQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDdEMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsS0FBSyxJ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
