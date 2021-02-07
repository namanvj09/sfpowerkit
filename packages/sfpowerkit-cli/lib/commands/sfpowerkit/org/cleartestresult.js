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
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const queryExecutor_1 = __importDefault(
  require("../../../utils/queryExecutor")
);
const sfpowerkit_1 = require("../../../sfpowerkit");
const chunkArray_1 = require("../../../utils/chunkArray");
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const CODECOVAGG_QUERY = `SELECT Id FROM ApexCodeCoverageAggregate`;
const APEXTESTRESULT_QUERY = `SELECT Id FROM ApexTestResult`;
class Cleartestresult extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel("Info", this.flags.json);
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      this.ux.startSpinner(`Clearing Test results`);
      let queryUtil = new queryExecutor_1.default(conn);
      let codeCovAgg = yield queryUtil.executeQuery(CODECOVAGG_QUERY, true);
      yield this.deleteRecords(conn, "ApexCodeCoverageAggregate", codeCovAgg);
      let testResults = yield queryUtil.executeQuery(
        APEXTESTRESULT_QUERY,
        true
      );
      yield this.deleteRecords(conn, "ApexTestResult", testResults);
      this.ux.stopSpinner();
      sfpowerkit_1.SFPowerkit.log(
        `Test results cleared in ${this.org.getUsername()} successfully.`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      return true;
    });
  }
  deleteRecords(conn, objectType, records) {
    return __awaiter(this, void 0, void 0, function* () {
      if (records && records.length > 0) {
        let idsList = records.map((elem) => elem.Id);
        let errors = [];
        for (let idsTodelete of chunkArray_1.chunkArray(2000, idsList)) {
          const deleteResults = yield conn.tooling.destroy(
            objectType,
            idsTodelete
          );
          deleteResults.forEach((elem) => {
            if (!elem.success) {
              errors = errors.concat(elem.errors);
            }
          });
        }
        if (errors.length > 0) {
          throw new core_1.SfdxError(JSON.stringify(errors));
        }
      }
    });
  }
}
exports.default = Cleartestresult;
Cleartestresult.description = `This command helps to clear any test results and code coverage in the org to get fresh and enhanced coverage everytime`;
Cleartestresult.examples = [
  `$ sfdx sfpowerkit:org:cleartestresult -u myOrg@example.com`,
];
// Comment this out if your command does not require an org username
Cleartestresult.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJ0ZXN0cmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3NmcG93ZXJraXQvb3JnL2NsZWFydGVzdHJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFrRDtBQUNsRCwyQ0FBeUQ7QUFFekQsaUZBQW9EO0FBQ3BELG9EQUE4RDtBQUM5RCwwREFBdUQ7QUFFdkQsaUdBQWlHO0FBQ2pHLG1GQUFtRjtBQUNuRixNQUFNLGdCQUFnQixHQUFHLDBDQUEwQyxDQUFDO0FBQ3BFLE1BQU0sb0JBQW9CLEdBQUcsK0JBQStCLENBQUM7QUFFN0QsTUFBcUIsZUFBZ0IsU0FBUSxxQkFBVztJQVV6QyxHQUFHOztZQUNkLHVCQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUU3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXRDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFFOUMsSUFBSSxTQUFTLEdBQUcsSUFBSSx1QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksVUFBVSxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RSxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXhFLElBQUksV0FBVyxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRSxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFdEIsdUJBQVUsQ0FBQyxHQUFHLENBQ1osMkJBQTJCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUNqRSx3QkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBQ2EsYUFBYSxDQUN6QixJQUFnQixFQUNoQixVQUFrQixFQUNsQixPQUFjOztZQUVkLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLE9BQU8sR0FBYSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxJQUFJLFdBQVcsSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtvQkFDakQsTUFBTSxhQUFhLEdBQVEsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FDbkQsVUFBVSxFQUNWLFdBQVcsQ0FDWixDQUFDO29CQUNGLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7NEJBQ2pCLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDckM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDckIsTUFBTSxJQUFJLGdCQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUM3QzthQUNGO1FBQ0gsQ0FBQztLQUFBOztBQTFESCxrQ0EyREM7QUExRGUsMkJBQVcsR0FBRyx3SEFBd0gsQ0FBQztBQUV2SSx3QkFBUSxHQUFHO0lBQ3ZCLDREQUE0RDtDQUM3RCxDQUFDO0FBRUYsb0VBQW9FO0FBQ25ELGdDQUFnQixHQUFHLElBQUksQ0FBQyJ9
