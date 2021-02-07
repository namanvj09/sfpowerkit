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
exports.HealthResult = void 0;
const command_1 = require("@salesforce/command");
const fs = __importStar(require("fs-extra"));
let request = require("request-promise-native");
const rimraf = __importStar(require("rimraf"));
const querystring = require("querystring");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "org_healthcheck"
);
class HealthCheck extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.flags.apiversion =
        this.flags.apiversion || (yield conn.retrieveMaxApiVersion());
      var healthResult = new HealthResult();
      healthResult.score = yield this.getOrgHealthScore(conn);
      var riskItems = yield this.getOrgHealthHighRisks(conn);
      riskItems.forEach((element) => {
        healthResult.highriskitems.push(element.Setting);
      });
      riskItems = yield this.getOrgHealthMediumRisks(conn);
      riskItems.forEach((element) => {
        healthResult.mediumriskitems.push(element.Setting);
      });
      riskItems = yield this.getOrgHealthLowRisks(conn);
      riskItems.forEach((element) => {
        healthResult.lowriskitems.push(element.Setting);
      });
      riskItems = yield this.getInformationalRisks(conn);
      riskItems.forEach((element) => {
        healthResult.informationalriskitems.push(element.Setting);
      });
      if (this.flags.outputfile) {
        yield fs.outputJSON(this.flags.outputfile, healthResult);
      }
      this.ux.log(`Successfully Retrived Health Check Details`);
      this.ux.logJson(healthResult);
      return true;
    });
  }
  getOrgHealthScore(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT Score FROM SecurityHealthCheck`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      //this.ux.log(`Query URI ${query_uri}`);
      const health_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return health_score_query_result.records[0].Score;
    });
  }
  getOrgHealthHighRisks(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks where RiskType='HIGH_RISK'`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      // this.ux.log(`Query URI ${query_uri}`);
      const health_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return health_score_query_result.records;
    });
  }
  getOrgHealthMediumRisks(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks where RiskType='MEDIUM_RISK'`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      // this.ux.log(`Query URI ${query_uri}`);
      const health_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return health_score_query_result.records;
    });
  }
  getOrgHealthLowRisks(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks where RiskType='LOW_RISK'`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      // this.ux.log(`Query URI ${query_uri}`);
      const health_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return health_score_query_result.records;
    });
  }
  getInformationalRisks(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      var encoded_querystring = querystring.escape(
        `SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks where RiskType='INFORMATIONAL'`
      );
      var query_uri = `${conn.instanceUrl}/services/data/v${this.flags.apiversion}/tooling/query?q=${encoded_querystring}`;
      // this.ux.log(`Query URI ${query_uri}`);
      const health_score_query_result = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      // this.ux.logJson(health_score_query_result);
      return health_score_query_result.records;
    });
  }
}
exports.default = HealthCheck;
HealthCheck.description = messages.getMessage("commandDescription");
HealthCheck.examples = [
  `$ sfdx sfpowerkit:org:healthcheck  -u myOrg@example.com
  Successfully Retrived the healthstatus of the org
  `,
];
// Comment this out if your command does not require an org username
HealthCheck.requiresUsername = true;
class HealthResult {
  constructor() {
    this.highriskitems = [];
    this.mediumriskitems = [];
    this.lowriskitems = [];
    this.informationalriskitems = [];
  }
}
exports.HealthResult = HealthResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhbHRoY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9vcmcvaGVhbHRoY2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUF1RTtBQUV2RSw2Q0FBK0I7QUFDL0IsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDaEQsK0NBQWlDO0FBQ2pDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUUzQyx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBRTdFLE1BQXFCLFdBQVksU0FBUSxxQkFBVztJQVlyQyxHQUFHOztZQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUvQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV0QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLElBQUksWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7WUFFdEMsWUFBWSxDQUFDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RCxJQUFJLFNBQVMsR0FB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
