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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const command_1 = require("@salesforce/command");
const rimraf = require("rimraf");
const core_1 = require("@salesforce/core");
const xml2js = require("xml2js");
const util = require("util");
const getPackageInfo_1 = require("../../../../utils/getPackageInfo");
const searchFilesInDirectory_1 = require("../../../../utils/searchFilesInDirectory");
const zipDirectory_1 = require("../../../../utils/zipDirectory");
const metadataFiles_1 = __importDefault(
  require("../../../../impl/metadata/metadataFiles")
);
const sfpowerkit_1 = require("../../../../sfpowerkit");
const fileutils_1 = __importDefault(require("../../../../utils/fileutils"));
var path = require("path");
const glob = require("glob");
const spawn = require("child-process-promise").spawn;
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "source_picklist_generatepatch"
);
class Generatepatch extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      //clean any existing temp sf powerkit source folder
      this.folderPath = `temp_sfpowerkit_${fileutils_1.default.makefolderid(
        5
      )}`;
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      // Getting Project config
      const project = yield core_1.SfdxProject.resolve();
      const projectJson = yield project.retrieveSfdxProjectJson();
      //Retrieve the package
      let packageToBeUsed;
      if (this.flags.package)
        packageToBeUsed = getPackageInfo_1.getPackageInfo(
          projectJson,
          this.flags.package
        );
      else {
        packageToBeUsed = getPackageInfo_1.getDefaultPackageInfo(projectJson);
      }
      this.flags.apiversion =
        this.flags.apiversion || projectJson.get("sourceApiVersion");
      //set objects directory
      let objectsDirPaths = glob.sync(packageToBeUsed.path + "/**/objects", {
        absolute: false,
      });
      let picklistFields = [];
      if (objectsDirPaths.length > 0) {
        for (let objectsDirPath of objectsDirPaths) {
          let fieldsInPath = yield this.generatePatchForCustomPicklistField(
            objectsDirPath
          );
          if (fieldsInPath.length > 0) {
            picklistFields = picklistFields.concat(fieldsInPath);
            yield this.generatePatchForRecordTypes(objectsDirPath);
          }
        }
      }
      if (picklistFields.length > 0) {
        yield this.generateStaticResource(packageToBeUsed);
      }
      //clean temp sf powerkit source folder
      rimraf.sync(this.folderPath);
      return picklistFields;
    });
  }
  generatePatchForCustomPicklistField(objectsDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
      let result = [];
      sfpowerkit_1.SFPowerkit.log(
        `Scanning for picklist fields in ${objectsDirPath}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      //search picklist
      let customFieldsWithPicklist = searchFilesInDirectory_1.searchFilesInDirectory(
        objectsDirPath,
        "<type>Picklist</type>",
        ".xml"
      );
      //search MultiselectPicklist
      let customFieldsWithMultiPicklist = searchFilesInDirectory_1.searchFilesInDirectory(
        objectsDirPath,
        "<type>MultiselectPicklist</type>",
        ".xml"
      );
      if (
        customFieldsWithMultiPicklist &&
        customFieldsWithMultiPicklist.length > 0
      ) {
        customFieldsWithPicklist = customFieldsWithPicklist.concat(
          customFieldsWithMultiPicklist
        );
      }
      if (customFieldsWithPicklist && customFieldsWithPicklist.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `Found ${customFieldsWithPicklist.length} picklist fields in ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        sfpowerkit_1.SFPowerkit.log(
          `Processing and adding the following fields to patch in ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.DEBUG
        );
        for (const file of customFieldsWithPicklist) {
          const parser = new xml2js.Parser({
            explicitArray: false,
          });
          const parseString = util.promisify(parser.parseString);
          let field_metadata;
          try {
            field_metadata = yield parseString(
              fs_extra_1.default.readFileSync(path.resolve(file))
            );
          } catch (e) {
            sfpowerkit_1.SFPowerkit.log(
              `Unable to parse file ${file} due to ${e}`,
              sfpowerkit_1.LoggerLevel.FATAL
            );
            return Promise.reject(e);
          }
          if (
            field_metadata.CustomField.valueSet &&
            !field_metadata.CustomField.fieldManageability
          ) {
            result.push(file);
            sfpowerkit_1.SFPowerkit.log(
              `Copied Original to Patch: ${file}`,
              sfpowerkit_1.LoggerLevel.INFO
            );
            metadataFiles_1.default.copyFile(file, this.folderPath);
          }
        }
        sfpowerkit_1.SFPowerkit.log(
          `Added ${result.length} picklist fields into patch from ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `No picklist fields found in ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        "--------------------------------------------------------------------------------",
        sfpowerkit_1.LoggerLevel.INFO
      );
      return result;
    });
  }
  generatePatchForRecordTypes(objectsDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        `Scanning for recordtypes in ${objectsDirPath}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      let recordTypes = searchFilesInDirectory_1.searchFilesInDirectory(
        objectsDirPath,
        '<RecordType xmlns="http://soap.sforce.com/2006/04/metadata">',
        ".xml"
      );
      if (recordTypes && recordTypes.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `Found ${recordTypes.length} RecordTypes in ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        sfpowerkit_1.SFPowerkit.log(
          `Processing and adding the following recordtypes to patch in ${objectsDirPath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        for (const file of recordTypes) {
          sfpowerkit_1.SFPowerkit.log(
            `Copied Original to Patch: ${file}`,
            sfpowerkit_1.LoggerLevel.INFO
          );
          metadataFiles_1.default.copyFile(file, this.folderPath);
        }
      }
      sfpowerkit_1.SFPowerkit.log(
        "--------------------------------------------------------------------------------",
        sfpowerkit_1.LoggerLevel.INFO
      );
      return true;
    });
  }
  generateStaticResource(packageToBeUsed) {
    return __awaiter(this, void 0, void 0, function* () {
      // sfdx project json file running force source command
      var sfdx_project_json = `{	
      "packageDirectories": [	
        {	
          "path": "${packageToBeUsed.path}",	
          "default": true	
        }	
      ],	
      "namespace": "",	
      "sourceApiVersion": "${this.flags.apiversion}"	
    }`;
      fs_extra_1.default.outputFileSync(
        `${this.folderPath}/sfdx-project.json`,
        sfdx_project_json
      );
      if (
        fs_extra_1.default.existsSync(
          path.resolve(`${this.folderPath}/${packageToBeUsed.path}`)
        )
      ) {
        //Convert to mdapi
        const args = [];
        args.push("force:source:convert");
        args.push("-r");
        args.push(`${packageToBeUsed.path}`);
        args.push("-d");
        args.push(`mdapi`);
        yield spawn("sfdx", args, {
          stdio: "ignore",
          cwd: this.folderPath,
        });
        //Generate zip file
        var zipFile = `${this.folderPath}/${packageToBeUsed.package}_picklist.zip`;
        yield zipDirectory_1.zipDirectory(`${this.folderPath}/mdapi`, zipFile);
        //Create Static Resource Directory if not exist
        let dir = packageToBeUsed.path + `/main/default/staticresources/`;
        if (!fs_extra_1.default.existsSync(dir)) {
          fs_extra_1.default.mkdirpSync(dir);
        }
        fs_extra_1.default.copyFileSync(
          zipFile,
          `${dir}${packageToBeUsed.package}_picklist.zip`
        );
        //Store it to static resources
        var metadata = `<?xml version="1.0" encoding="UTF-8"?>	
      <StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">	
          <cacheControl>Public</cacheControl>	
          <contentType>application/zip</contentType>	
      </StaticResource>`;
        let targetmetadatapath = `${dir}${packageToBeUsed.package}_picklist.resource-meta.xml`;
        sfpowerkit_1.SFPowerkit.log(
          `Generating static resource file : ${targetmetadatapath}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        fs_extra_1.default.outputFileSync(targetmetadatapath, metadata);
        sfpowerkit_1.SFPowerkit.log(
          `Patch ${packageToBeUsed.package}_picklist generated successfully.`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `No picklist fields found in package ${packageToBeUsed.package}`,
          sfpowerkit_1.LoggerLevel.WARN
        );
      }
    });
  }
}
exports.default = Generatepatch;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Generatepatch.requiresProject = true;
Generatepatch.description = messages.getMessage("commandDescription");
Generatepatch.examples = [
  `$ sfdx sfpowerkit:source:picklist:generatepatch -p sfpowerkit_test`,
];
Generatepatch.flagsConfig = {
  package: command_1.flags.string({
    required: false,
    char: "p",
    description: messages.getMessage("packageFlagDescription"),
  }),
  loglevel: command_1.flags.enum({
    description: messages.getMessage("loglevel"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVwYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3NvdXJjZS9waWNrbGlzdC9nZW5lcmF0ZXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQTBCO0FBQzFCLGlEQUErRDtBQUMvRCxpQ0FBa0M7QUFDbEMsMkNBQStDO0FBQy9DLGlDQUFrQztBQUNsQyw2QkFBOEI7QUFDOUIscUVBRzBDO0FBQzFDLHFGQUFrRjtBQUVsRixpRUFBOEQ7QUFDOUQsNEZBQW9FO0FBQ3BFLHVEQUFpRTtBQUNqRSw0RUFBb0Q7QUFFcEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFFckQsd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLCtCQUErQixDQUNoQyxDQUFDO0FBRUYsTUFBcUIsYUFBYyxTQUFRLHFCQUFXO0lBcUN2QyxHQUFHOztZQUNkLG1EQUFtRDtZQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLG1CQUFtQixtQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRWpFLHVCQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0QseUJBQXlCO1lBQ3pCLE1BQU0sT0FB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
