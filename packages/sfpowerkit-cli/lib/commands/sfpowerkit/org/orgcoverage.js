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
exports.ApexCoverage = void 0;
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
let request = require("request-promise-native");
const rimraf = __importStar(require("rimraf"));
const querystring = require("querystring");
const metadataSummaryInfoFetcher_1 = __importDefault(
  require("../../../impl/metadata/retriever/metadataSummaryInfoFetcher")
);
const dependencyImpl_1 = __importDefault(
  require("../../../impl/dependency/dependencyImpl")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "org_coverage"
);
class OrgCoverage extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.flags.output && !this.flags.format) {
        throw new core_1.SfdxError("format is required to generate the output");
      } else if (this.flags.format && !this.flags.output) {
        throw new core_1.SfdxError(
          "output path is required to generate the output"
        );
      }
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      var apexcoverage = new ApexCoverage();
      apexcoverage.coverage = yield this.getApexCoverage(conn);
      this.ux.log(
        `Successfully Retrieved the Apex Test Coverage of the org ${this.org.getOrgId()} `
      );
      this.ux.log(`coverage:${apexcoverage.coverage}`);
      const classCoverage = yield this.getApexCoverageByDetails(
        conn,
        this.flags.output
      );
      return { coverage: apexcoverage.coverage, classCoverage: classCoverage };
    });
  }
  getApexCoverage(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT PercentCovered FROM ApexOrgWideCoverage`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      const coverage_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return coverage_score_query_result.records[0].PercentCovered;
    });
  }
  getApexCoverageByDetails(conn, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let metadataVsPackageMap = yield this.getmetadataVsPackageMap(conn);
      let query =
        "SELECT ApexClassOrTriggerId, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, coverage FROM ApexCodeCoverageAggregate WHERE ApexClassOrTriggerId != null AND ApexClassOrTrigger.Name != null ORDER BY ApexClassOrTrigger.Name";
      const results = yield conn.tooling.query(query);
      const output = [];
      if (results.size > 0) {
        results.records.forEach((element) => {
          let percentage;
          let comments = "";
          if (
            element.NumLinesCovered === 0 &&
            element.NumLinesUncovered === 0
          ) {
            percentage = "NA";
          } else {
            percentage = this.percentCalculate(
              element.NumLinesCovered,
              element.NumLinesUncovered
            );
            comments = this.getComments(percentage);
            percentage = `${percentage}%`;
          }
          output.push({
            id: element.ApexClassOrTriggerId,
            package: metadataVsPackageMap.has(element.ApexClassOrTrigger.Name)
              ? metadataVsPackageMap.get(element.ApexClassOrTrigger.Name)
              : "",
            name: element.ApexClassOrTrigger.Name,
            type: element.ApexClassOrTrigger.attributes.url.split("/")[6],
            percentage: percentage,
            comments: comments,
            uncoveredLines: element.Coverage.uncoveredLines.join(";"),
          });
        });
        this.ux.table(output, [
          "id",
          "package",
          "name",
          "type",
          "percentage",
          "comments",
          "uncoveredLines",
        ]);
        if (outputDir && this.flags.format === "json") {
          rimraf.sync(outputDir);
          yield this.generateJsonOutput(output, outputDir);
        } else if (outputDir && this.flags.format === "csv") {
          rimraf.sync(outputDir);
          yield this.generateCSVOutput(output, outputDir);
        }
      }
      return output;
    });
  }
  percentCalculate(covered, uncovered) {
    return covered === 0
      ? 0
      : Math.round((covered / (covered + uncovered)) * 100);
  }
  getComments(percentage) {
    return percentage < 75
      ? "Action required"
      : percentage >= 75 && percentage < 85
      ? "Looks fine but target more than 85%"
      : "";
  }
  generateJsonOutput(testResult, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let outputJsonPath = `${outputDir}/output.json`;
      let dir = path.parse(outputJsonPath).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      fs.writeFileSync(outputJsonPath, JSON.stringify(testResult));
      this.ux.log(`Output ${outputDir}/output.json is generated successfully`);
    });
  }
  generateCSVOutput(testResult, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
      let outputcsvPath = `${outputDir}/output.csv`;
      let dir = path.parse(outputcsvPath).dir;
      if (!fs.existsSync(dir)) {
        fileutils_1.default.mkDirByPathSync(dir);
      }
      let newLine = "\r\n";
      let output =
        "ID,PACKAGE,NAME,TYPE,PERCENTAGE,COMMENTS,UNCOVERED LINES" + newLine;
      testResult.forEach((element) => {
        output = `${output}${element.id},${element.package},${element.name},${element.type},${element.percentage},${element.comments},${element.uncoveredLines}${newLine}`;
      });
      fs.writeFileSync(outputcsvPath, output);
      this.ux.log(`Output ${outputDir}/output.csv is generated successfully`);
    });
  }
  getmetadataVsPackageMap(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let metadataMap = new Map();
      metadataMap = yield metadataSummaryInfoFetcher_1.default.fetchMetadataSummaryByTypesFromAnOrg(
        conn,
        [
          { type: "ApexClass", folder: null },
          { type: "ApexTrigger", folder: null },
        ],
        metadataMap
      );
      let subjectKeyPrefixList = ["01p", "01q"];
      let packageMember = yield dependencyImpl_1.default.getMemberVsPackageNameMapByKeyPrefix(
        conn,
        subjectKeyPrefixList
      );
      let metadataVsPackageMap = new Map();
      for (let subjectId of metadataMap.keys()) {
        if (packageMember.has(subjectId)) {
          metadataVsPackageMap.set(
            metadataMap.get(subjectId).fullName,
            packageMember.get(subjectId)
          );
        }
      }
      return metadataVsPackageMap;
    });
  }
}
exports.default = OrgCoverage;
OrgCoverage.description = messages.getMessage("commandDescription");
OrgCoverage.examples = [
  `$  sfdx sfpowerkit:org:orgcoverage  -u myOrg@example.com
  sfdx sfpowerkit:org:orgcoverage  -u myOrg@example.com -d testResult -f csv
  sfdx sfpowerkit:org:orgcoverage  -u myOrg@example.com -d testResult -f json


  Successfully Retrieved the Apex Test Coverage of the org XXXX
  coverage:85
  ID                 PACKAGE       NAME                  TYPE          PERCENTAGE    COMMENTS                              UNCOVERED LINES
  ───────            ────────      ──────────────────    ────────      ──────────    ───────────────────────────────────   ──────────────────
  01pxxxx            core          sampleController      ApexClass     100%
  01pxxxx            core          sampletriggerHandler  ApexClass     80%           Looks fine but target more than 85%   62;76;77;
  01pxxxx            consumer      sampleHelper          ApexClass     72%           Action required                       62;76;77;78;98;130;131
  01qxxxx            consumer      sampleTrigger         ApexTrigger   100%
  Output testResult/output.csv is generated successfully
  `,
];
OrgCoverage.flagsConfig = {
  output: command_1.flags.string({
    char: "d",
    description: messages.getMessage("outputFolderDescription"),
    required: false,
  }),
  format: command_1.flags.enum({
    required: false,
    char: "f",
    description: messages.getMessage("formatFlagDescription"),
    options: ["json", "csv"],
  }),
};
// Comment this out if your command does not require an org username
OrgCoverage.requiresUsername = true;
class ApexCoverage {}
exports.ApexCoverage = ApexCoverage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnY292ZXJhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvb3JnY292ZXJhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQU02QjtBQUM3QiwyQ0FBNkM7QUFFN0MsNkNBQStCO0FBQy9CLDJDQUE2QjtBQUM3Qix5RUFBaUQ7QUFDakQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDaEQsK0NBQWlDO0FBQ2pDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUUzQyw2SEFFcUU7QUFDckUsNkZBQXFFO0FBRXJFLHdEQUF3RDtBQUN4RCxjQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRWpELGlHQUFpRztBQUNqRyxtRkFBbUY7QUFDbkYsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRTFFLE1BQXFCLFdBQVksU0FBUSxxQkFBVztJQXNDckMsR0FBRzs7WUFDZCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQzNDLE1BQU0sSUFBSSxnQkFBUyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7YUFDbEU7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNsRCxNQUFNLElBQUksZ0JBQVMsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO2FBQ3ZFO1lBRUQsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTdCLE1BQU0sSUFBSSxH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
