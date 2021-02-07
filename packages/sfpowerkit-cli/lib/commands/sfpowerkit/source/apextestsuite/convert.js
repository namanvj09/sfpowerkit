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
const fs = __importStar(require("fs-extra"));
const command_1 = require("@salesforce/command");
const rimraf = __importStar(require("rimraf"));
const core_1 = require("@salesforce/core");
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const fg = require("fast-glob");
const sfpowerkit_1 = require("../../../../sfpowerkit");
var path = require("path");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "apextestsuite_convert"
);
class Convert extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      const entries = fg.sync(`**${this.flags.name}.testSuite-meta.xml`, {
        onlyFiles: true,
        absolute: true,
        baseNameMatch: true,
      });
      if (!entries[0])
        throw new core_1.SfdxError(
          `Apex Test Suite ${this.flags.name} not found`
        );
      sfpowerkit_1.SFPowerkit.log(
        `Apex Test Suite File Path ${entries[0]}`,
        core_1.LoggerLevel.DEBUG
      );
      if (fs.existsSync(path.resolve(entries[0]))) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parseString = util.promisify(parser.parseString);
        let apex_test_suite = yield parseString(
          fs.readFileSync(path.resolve(entries[0]))
        );
        let testclasses;
        const doublequote = '"';
        if (apex_test_suite.ApexTestSuite.testClassName.constructor === Array) {
          testclasses =
            doublequote +
            apex_test_suite.ApexTestSuite.testClassName.join() +
            doublequote;
        } else {
          testclasses =
            doublequote +
            apex_test_suite.ApexTestSuite.testClassName +
            doublequote;
        }
        this.ux.log(testclasses);
        return testclasses;
      } else {
        throw new core_1.SfdxError("Apex Test Suite not found");
      }
    });
  }
}
exports.default = Convert;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Convert.requiresProject = true;
Convert.description = messages.getMessage("commandDescription");
Convert.examples = [
  `$ sfdx sfpowerkit:source:apextestsuite:convert -n MyApexTestSuite 
    "ABC2,ABC1Test"    
  `,
];
Convert.flagsConfig = {
  name: command_1.flags.string({
    required: true,
    char: "n",
    description: messages.getMessage("nameFlagDescription"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3NvdXJjZS9hcGV4dGVzdHN1aXRlL2NvbnZlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsNkNBQStCO0FBQy9CLGlEQUErRDtBQUMvRCwrQ0FBaUM7QUFDakMsMkNBQXVFO0FBQ3ZFLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBT2hDLHVEQUFvRDtBQUNwRCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFM0Isd0RBQXdEO0FBQ3hELGNBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDekMsWUFBWSxFQUNaLHVCQUF1QixDQUN4QixDQUFDO0FBRUYsTUFBcUIsT0FBUSxTQUFRLHFCQUFXO0lBdUNqQyxHQUFHOztZQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUvQix1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUkscUJBQXFCLEVBQUU7Z0JBQ2pFLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFFBQVEsRUFBRSxJQUFJO2dCQUNkLGFBQWEsRUFBRSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxPQUFPLENB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
