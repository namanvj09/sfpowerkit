"use strict";
//Code initially based from https://github.com/texei/texei-sfdx-plugin
//Updated to reflect mono repo (mpd), handle tags, individual package and skip install if already installed scenarios
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
const core_1 = require("@salesforce/core");
const GetNodeWrapper_1 = require("../../../../sfdxnode/GetNodeWrapper");
const parallel_1 = require("../../../..//sfdxnode/parallel");
const sfpowerkit_1 = require("../../../../sfpowerkit");
const util_1 = require("util");
let retry = require("async-retry");
const packageIdPrefix = "0Ho";
const packageVersionIdPrefix = "04t";
const packageAliasesMap = [];
const defaultWait = 60;
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages("sfpowerkit", "install");
class Install extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      const result = { installedPackages: {} };
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, false);
      // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
      const username = this.org.getUsername();
      // Getting Project config
      const projectMain = yield core_1.SfdxProject.resolve();
      const project = yield projectMain.retrieveSfdxProjectJson();
      // Getting a list of alias
      const packageAliases = project.get("packageAliases") || {};
      if (typeof packageAliases !== undefined) {
        Object.entries(packageAliases).forEach(([key, value]) => {
          packageAliasesMap[key] = value;
        });
      }
      //Validate Packages  installed in the target org
      let installedpackages = [];
      try {
        installedpackages = yield this.getInstalledPackages(username);
      } catch (error) {
        console.log(
          "Unable to retrieve the packages installed in the org, Proceeding",
          sfpowerkit_1.LoggerLevel.WARN
        );
      }
      if (
        util_1.isNullOrUndefined(installedpackages) ||
        installedpackages.length == 0
      ) {
        this.flags.updateall = true;
        installedpackages = [];
      }
      let individualpackage = this.flags.individualpackage;
      const packageDirectories = project.get("packageDirectories") || [];
      // get branch filter
      this.branchMap = new Map();
      if (this.flags.branch) {
        this.branchMap = this.parseKeyValueMapfromString(
          this.flags.branch,
          "Branch",
          "core:branchname consumer:branchname packageN:branchname"
        );
      }
      //get tag filter
      this.tagMap = new Map();
      if (this.flags.tag) {
        this.tagMap = this.parseKeyValueMapfromString(
          this.flags.tag,
          "Tag",
          "core:tag consumer:tag packageN:tag"
        );
      }
      // get all packages in the mono repo project
      let monoRepoPackages = [];
      for (let packageDirectory of packageDirectories) {
        packageDirectory = packageDirectory;
        if (
          packageDirectory.path &&
          packageDirectory.package &&
          !monoRepoPackages.includes(packageDirectory.package.toString())
        ) {
          monoRepoPackages.push(packageDirectory.package.toString());
        }
      }
      // Getting Package
      let packagesToInstall = new Map();
      for (let packageDirectory of packageDirectories) {
        packageDirectory = packageDirectory;
        const dependencies = packageDirectory.dependencies || [];
        if (
          this.flags.filterpaths &&
          this.flags.filterpaths.length > 0 &&
          !this.flags.filterpaths.includes(packageDirectory.path.toString())
        ) {
          continue;
        }
        if (dependencies && dependencies[0] !== undefined) {
          this.ux.log(
            `\nPackage dependencies found for package directory ${packageDirectory.path}`
          );
          for (const dependency of dependencies) {
            let packageInfo = {};
            const { package: packageName, versionNumber } = dependency;
            packageInfo.packageName = packageName;
            packageInfo.versionNumber = versionNumber;
            let packageVersionDetail = yield this.getPackageVersionDetails(
              packageName,
              versionNumber
            );
            packageInfo.packageVersionId = packageVersionDetail.versionId;
            packageInfo.versionNumber = packageVersionDetail.versionNumber;
            if (individualpackage) {
              if (
                packageInfo.packageName.toString() === individualpackage ||
                packageInfo.packageVersionId.toString() === individualpackage
              ) {
                packagesToInstall.set(
                  packageInfo.packageVersionId.toString(),
                  packageInfo
                );
                continue;
              }
            } else {
              if (this.flags.updateall) {
                packagesToInstall.set(
                  packageInfo.packageVersionId.toString(),
                  packageInfo
                );
              } else {
                if (
                  !installedpackages.includes(packageInfo.packageVersionId) &&
                  !monoRepoPackages.includes(packageInfo.packageName)
                ) {
                  packagesToInstall.set(
                    packageInfo.packageVersionId.toString(),
                    packageInfo
                  );
                }
              }
            }
            this.ux.log(
              `    ${packageInfo.packageVersionId} : ${
                packageInfo.packageName
              }${
                packageInfo.versionNumber === undefined
                  ? ""
                  : " " + packageInfo.versionNumber
              }`
            );
          }
        } else {
          this.ux.log(
            `\nNo dependencies found for package directory ${packageDirectory.path}`
          );
        }
      }
      if (packagesToInstall.size > 0) {
        //Load SFDX
        GetNodeWrapper_1.loadSFDX();
        // Installing Packages
        let installationKeyMap = new Map();
        // Getting Installation Key(s)
        if (this.flags.installationkeys) {
          installationKeyMap = this.parseKeyValueMapfromString(
            this.flags.installationkeys,
            "Installation Key",
            "core:key nCino:key vlocity:key"
          );
        }
        let packagesToInstallArray = Array.from(packagesToInstall.values());
        this.ux.log(
          `\nThe following dependencies will be installed in the org ${username} in below order`
        );
        this.ux.table(packagesToInstallArray, [
          "packageName",
          "versionNumber",
          "packageVersionId",
        ]);
        this.ux.log(`\n`);
        for (let packageInfo of packagesToInstallArray) {
          packageInfo = packageInfo;
          if (
            result.installedPackages.hasOwnProperty(
              packageInfo.packageVersionId.toString()
            )
          ) {
            this.ux.log(
              `PackageVersionId ${packageInfo.packageVersionId} already installed. Skipping...`
            );
            continue;
          }
          //Build up options
          let flags = {};
          // USERNAME
          flags["targetusername"] = username;
          // PACKAGE ID
          flags["package"] = packageInfo.packageVersionId;
          // INSTALLATION KEY
          if (
            installationKeyMap &&
            installationKeyMap.has(packageInfo.packageName.toString())
          ) {
            let key = installationKeyMap.get(
              packageInfo.packageName.toString()
            );
            flags["installationkey"] = key;
          }
          // WAIT
          const wait = this.flags.wait ? this.flags.wait.trim() : defaultWait;
          flags["wait"] = wait;
          flags["publishwait"] = wait;
          if (this.flags.apexcompileonlypackage) {
            flags["apexcompile"] = "package";
          }
          let opts = [];
          // NOPROMPT
          if (this.flags.noprompt) {
            opts.push("--noprompt");
          }
          let startTime = new Date().valueOf();
          this.ux.log(
            `Installing package ${packageInfo.packageVersionId} : ${
              packageInfo.packageName
            }${
              packageInfo.versionNumber === undefined
                ? ""
                : " " + packageInfo.versionNumber
            }`
          );
          yield parallel_1.sfdx.force.package.install(flags, opts);
          var endTime = new Date().valueOf();
          var timeElapsed = (endTime - startTime) / 1000;
          this.ux.log(
            `Elapsed time in installing package  ${packageInfo.packageVersionId} is ${timeElapsed} seconds`
          );
          this.ux.log("\n");
          result.installedPackages[
            packageInfo.packageVersionId.toString()
          ] = packageInfo;
        }
      } else {
        this.ux.log(
          "\n \n Looks like there is nothing to be updated in this org"
        );
      }
      return { message: result };
    });
  }
  getPackageVersionDetails(name, version) {
    return __awaiter(this, void 0, void 0, function* () {
      let packageDetail;
      // Keeping original name so that it can be used in error message if needed
      let packageName = name;
      // TODO: Some stuff are duplicated here, some code don't need to be executed for every package
      // First look if it's an alias
      if (typeof packageAliasesMap[packageName] !== "undefined") {
        packageName = packageAliasesMap[packageName];
      }
      if (packageName.startsWith(packageVersionIdPrefix)) {
        // Package2VersionId is set directly
        packageDetail = { versionId: packageName, versionNumber: version };
      } else if (packageName.startsWith(packageIdPrefix)) {
        if (!version) {
          throw new command_1.core.SfdxError(
            `version number is mandatory for ${name}`
          );
        }
        // Get Package version id from package + versionNumber
        const vers = version.split(".");
        let query =
          "Select SubscriberPackageVersionId, IsPasswordProtected, IsReleased, MajorVersion, MinorVersion, PatchVersion,BuildNumber ";
        query += "from Package2Version ";
        query += `where Package2Id='${packageName}' and MajorVersion=${vers[0]} and MinorVersion=${vers[1]} and PatchVersion=${vers[2]} `;
        // If Build Number isn't set to LATEST, look for the exact Package Version
        if (vers[3] !== "LATEST") {
          query += `and BuildNumber=${vers[3]} `;
        } else if (this.flags.usedependencyvalidatedpackages) {
          query += `and ValidationSkipped = false `;
        }
        // If Branch is specified, use it to filter
        if (this.flags.branch && this.branchMap.has(name)) {
          query += `and Branch='${this.branchMap.get(name).trim()}' `;
        }
        // If tag is specified, use it to filter
        if (this.flags.tag && this.tagMap.has(name)) {
          query += `and Tag='${this.tagMap.get(name).trim()}' `;
        }
        query += "ORDER BY BuildNumber DESC, createddate DESC Limit 1";
        // Query DevHub to get the expected Package2Version
        const conn = this.hubOrg.getConnection();
        const resultPackageId = yield conn.tooling.query(query);
        if (resultPackageId.size === 0) {
          // Query returned no result
          const errorMessage = `Unable to find SubscriberPackageVersionId for dependent package ${name}`;
          throw new command_1.core.SfdxError(errorMessage);
        } else {
          let versionId = resultPackageId.records[0].SubscriberPackageVersionId;
          let versionNumber = `${resultPackageId.records[0].MajorVersion}.${resultPackageId.records[0].MinorVersion}.${resultPackageId.records[0].PatchVersion}.${resultPackageId.records[0].BuildNumber}`;
          packageDetail = {
            versionId: versionId,
            versionNumber: versionNumber,
          };
        }
      }
      return packageDetail;
    });
  }
  getInstalledPackages(targetOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let packages = [];
      let installedPackagesQuery =
        "SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, " +
        "SubscriberPackageVersion.Id, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, " +
        "SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber FROM InstalledSubscriberPackage " +
        "ORDER BY SubscriberPackageId";
      const conn = this.org.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            sfpowerkit_1.SFPowerkit.log(
              "QUERY:" + installedPackagesQuery,
              sfpowerkit_1.LoggerLevel.TRACE
            );
            const results = yield conn.tooling.query(installedPackagesQuery);
            const records = results.records;
            if (records && records.length > 0) {
              this.ux.log(`Installed Packages in the org ${targetOrg}`);
              const output = [];
              records.forEach((record) => {
                packages.push(record["SubscriberPackageVersion"]["Id"]);
                output.push({
                  name: record["SubscriberPackage"]["Name"],
                  package_version_name:
                    record["SubscriberPackageVersion"]["Name"],
                  package_version_id: record["SubscriberPackageVersion"]["Id"],
                  versionNumber: `${record["SubscriberPackageVersion"]["MajorVersion"]}.${record["SubscriberPackageVersion"]["MinorVersion"]}.${record["SubscriberPackageVersion"]["PatchVersion"]}.${record["SubscriberPackageVersion"]["BuildNumber"]}`,
                });
              });
              this.ux.table(output, [
                "name",
                "package_version_name",
                "package_version_id",
                "versionNumber",
              ]);
              return packages;
            }
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  parseKeyValueMapfromString(request, item, format) {
    let response = new Map();
    request = request.trim();
    let requestList = request.split(" ");
    for (let element of requestList) {
      let packageNameWithValue = element.split(":");
      if (packageNameWithValue.length === 2) {
        response.set(packageNameWithValue[0], packageNameWithValue[1]);
      } else {
        // Format is not correct, throw an error
        throw new command_1.core.SfdxError(
          `Error in parsing ${item}, format should be: ${format}`
        );
      }
    }
    return response;
  }
}
exports.default = Install;
Install.description = messages.getMessage("commandDescription");
Install.examples = [
  '$ sfdx sfpowerkit:package:dependencies:install -u MyScratchOrg -v MyDevHub -k "MyPackage1:Key MyPackage3:Key" -b "DEV"',
];
Install.flagsConfig = {
  individualpackage: command_1.flags.string({
    char: "p",
    required: false,
    description: "Installs a specific package especially for upgrade scenario",
  }),
  installationkeys: command_1.flags.string({
    char: "k",
    required: false,
    description:
      "installation key for key-protected packages (format is packagename:key --> core:key nCino:key vlocity:key to allow some packages without installation key)",
  }),
  branch: command_1.flags.string({
    char: "b",
    required: false,
    description:
      "the package version’s branch (format is packagename:branchname --> core:branchname consumer:branchname packageN:branchname)",
  }),
  tag: command_1.flags.string({
    char: "t",
    required: false,
    description:
      "the package version’s tag (format is packagename:tag --> core:tag consumer:tag packageN:tag)",
  }),
  wait: command_1.flags.string({
    char: "w",
    required: false,
    description:
      "number of minutes to wait for installation status (also used for publishwait). Default is 10",
  }),
  noprompt: command_1.flags.boolean({
    char: "r",
    required: false,
    description:
      "allow Remote Site Settings and Content Security Policy websites to send or receive data without confirmation",
  }),
  updateall: command_1.flags.boolean({
    char: "o",
    required: false,
    description:
      "update all packages even if they are installed in the target org",
  }),
  apexcompileonlypackage: command_1.flags.boolean({
    char: "a",
    required: false,
    description:
      "compile the apex only in the package, by default only the compilation of the apex in the entire org is triggered",
  }),
  usedependencyvalidatedpackages: command_1.flags.boolean({
    required: false,
    description:
      "use dependency validated packages that matches the version number schema provide",
  }),
  filterpaths: command_1.flags.array({
    char: "f",
    required: false,
    description:
      "in a mono repo project, filter packageDirectories using path and install dependent packages only for the specified path",
  }),
  loglevel: command_1.flags.enum({
    description: "logging level for this command invocation",
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
Install.requiresUsername = true;
// Comment this out if your command does not require a hub org username
Install.requiresDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Install.requiresProject = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3BhY2thZ2UvZGVwZW5kZW5jaWVzL2luc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNFQUFzRTtBQUN0RSxxSEFBcUg7Ozs7Ozs7Ozs7O0FBRXJILGlEQUErRDtBQUUvRCwyQ0FBK0M7QUFDL0Msd0VBQStEO0FBQy9ELDZEQUFzRDtBQUN0RCx1REFBaUU7QUFDakUsK0JBQXlDO0FBQ3pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVuQyxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFDckMsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDN0IsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBRXZCLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBRXJFLE1BQXFCLE9BQVEsU0FBUSxxQkFBVztJQW1HakMsR0FBRzs7WUFDZCxNQUFNLE1BQU0sR0FBRyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxDQUFDO1lBRXpDLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRW5ELHVGQUF1RjtZQUN2RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXhDLHlCQUF5QjtZQUN6QixNQUFNLFdBQVcsR0FBRyxNQUFNLGtCQUFXLENBQUMsT0FB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
