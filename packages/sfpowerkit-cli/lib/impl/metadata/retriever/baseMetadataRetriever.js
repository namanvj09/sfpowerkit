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
exports.executeQueryAsync = exports.executeBulkQueryAsync = exports.executeToolingQueryAsync = void 0;
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../sfpowerkit");
const progressBar_1 = require("../../.../../../ui/progressBar");
const BULK_THRESHOLD = 2000;
class BaseMetadataRetriever {
  constructor(org, tooling = false) {
    this.org = org;
    this.tooling = tooling;
    this.dataLoaded = false;
    this.cacheFileName = "";
    this.objectName = "";
  }
  setQuery(query) {
    this.query = query;
    this.countQuery = this.generateCountQuery();
  }
  generateCountQuery() {
    let queryParts = this.query.toUpperCase().split("FROM");
    let objectParts = queryParts[1].trim().split(" ");
    let objectName = objectParts[0].trim();
    this.objectName = objectName;
    let countQuery = `SELECT COUNT() FROM ${objectName}`;
    return countQuery;
  }
  getObjects() {
    return __awaiter(this, void 0, void 0, function* () {
      //let records: T[] = [];
      const conn = this.org.getConnection();
      if (this.tooling) {
        return executeToolingQueryAsync(this.query, conn, this.objectName);
      } else {
        let recordsCount = yield this.getCount();
        if (recordsCount > BULK_THRESHOLD) {
          return executeBulkQueryAsync(
            this.query,
            conn,
            this.objectName,
            recordsCount
          );
        } else {
          return executeQueryAsync(this.query, conn, this.objectName);
        }
      }
    });
  }
  getCount() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        `Count Query: ${this.countQuery}`,
        core_1.LoggerLevel.TRACE
      );
      let result = yield this.org.getConnection().query(this.countQuery);
      sfpowerkit_1.SFPowerkit.log(
        `Retrieved count ${result.totalSize}`,
        core_1.LoggerLevel.TRACE
      );
      return result.totalSize;
    });
  }
}
exports.default = BaseMetadataRetriever;
function executeToolingQueryAsync(query, conn, object) {
  return __awaiter(this, void 0, void 0, function* () {
    let promiseQuery = new Promise((resolve, reject) => {
      let records = [];
      let hasInitProgress = false;
      let progressBar = new progressBar_1.ProgressBar().create(
        `Querying data from ${object}`,
        `Records fetched`,
        core_1.LoggerLevel.DEBUG
      );
      let queryRun = conn.tooling
        .query(query)
        .on("record", function (record) {
          if (!hasInitProgress) {
            hasInitProgress = true;
            progressBar.start(queryRun.totalSize);
          }
          records.push(record);
          progressBar.increment(1);
        })
        .on("end", function () {
          progressBar.stop();
          resolve(records);
        })
        .on("error", function (error) {
          progressBar.stop();
          reject(error);
        })
        .run({
          autoFetch: true,
          maxFetch: 1000000,
        });
    });
    return promiseQuery;
  });
}
exports.executeToolingQueryAsync = executeToolingQueryAsync;
function executeBulkQueryAsync(query, conn, object, recordCount) {
  return __awaiter(this, void 0, void 0, function* () {
    let promiseQuery = new Promise((resolve, reject) => {
      let records = [];
      let hasInitProgress = false;
      let progressBar = new progressBar_1.ProgressBar().create(
        `Querying data from ${object}`,
        "Records fetched",
        core_1.LoggerLevel.DEBUG
      );
      sfpowerkit_1.SFPowerkit.log(`Using Bulk API`, core_1.LoggerLevel.DEBUG);
      conn.bulk
        .query(query)
        .on("record", function (record) {
          if (!hasInitProgress) {
            hasInitProgress = true;
            progressBar.start(recordCount);
          }
          records.push(record);
          progressBar.increment(1);
        })
        .on("end", function () {
          progressBar.stop();
          resolve(records);
        })
        .on("error", function (error) {
          progressBar.stop();
          sfpowerkit_1.SFPowerkit.log(
            `Error when using bulk api `,
            core_1.LoggerLevel.ERROR
          );
          sfpowerkit_1.SFPowerkit.log(error, core_1.LoggerLevel.ERROR);
          reject(error);
        });
    });
    return promiseQuery;
  });
}
exports.executeBulkQueryAsync = executeBulkQueryAsync;
function executeQueryAsync(query, conn, object) {
  return __awaiter(this, void 0, void 0, function* () {
    let promiseQuery = new Promise((resolve, reject) => {
      let records = [];
      let hasInitProgress = false;
      let progressBar = new progressBar_1.ProgressBar().create(
        `Querying data from ${object}`,
        "Records fetched",
        core_1.LoggerLevel.DEBUG
      );
      let queryRun = conn
        .query(query)
        .on("record", function (record) {
          if (!hasInitProgress) {
            hasInitProgress = true;
            progressBar.start(queryRun.totalSize);
          }
          records.push(record);
          progressBar.increment(1);
        })
        .on("end", function () {
          progressBar.stop();
          resolve(records);
        })
        .on("error", function (error) {
          progressBar.stop();
          reject(error);
        })
        .run({
          autoFetch: true,
          maxFetch: 1000000,
        });
    });
    return promiseQuery;
  });
}
exports.executeQueryAsync = executeQueryAsync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZU1ldGFkYXRhUmV0cmlldmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvbWV0YWRhdGEvcmV0cmlldmVyL2Jhc2VNZXRhZGF0YVJldHJpZXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBb0Q7QUFDcEQsb0RBQWlEO0FBQ2pELGdFQUE2RDtBQUU3RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFFNUIsTUFBOEIscUJBQXFCO0lBVWpELFlBQTZCLEdBQVEsRUFBVSxVQUFtQixLQUFLO1FBQTFDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUo3RCxlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ25CLGVBQVUsR0FBRyxFQUFFLENBQUM7SUFFZ0QsQ0FBQztJQUVqRSxRQUFRLENBQUMsS0FBYTtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFTyxrQkFBa0I7UUFDeEIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRCxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFN0IsSUFBSSxVQUFVLEdBQUcsdUJBQXVCLFVBQVUsRUFBRSxDQUFDO1FBRXJELE9BQU8sVUFBVSxDQUFD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
