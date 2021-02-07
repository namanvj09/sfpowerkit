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
const retry = require("async-retry");
class QueryExecutor {
  constructor(conn) {
    this.conn = conn;
  }
  executeQuery(query, tooling) {
    return __awaiter(this, void 0, void 0, function* () {
      let results;
      if (tooling) {
        results = yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              try {
                return yield this.conn.tooling.query(query);
              } catch (error) {
                throw error;
              }
            }),
          { retries: 3, minTimeout: 2000 }
        );
      } else {
        results = yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              try {
                return yield this.conn.query(query);
              } catch (error) {
                throw error;
              }
            }),
          { retries: 3, minTimeout: 2000 }
        );
      }
      if (!results.done) {
        let tempRecords = results.records;
        while (!results.done) {
          results = yield this.queryMore(results.nextRecordsUrl, tooling);
          tempRecords = tempRecords.concat(results.records);
        }
        results.records = tempRecords;
      }
      return results.records;
    });
  }
  queryMore(url, tooling) {
    return __awaiter(this, void 0, void 0, function* () {
      let result;
      if (tooling) {
        result = yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              try {
                return yield this.conn.tooling.queryMore(url);
              } catch (error) {
                throw error;
              }
            }),
          { retries: 3, minTimeout: 2000 }
        );
      } else {
        result = yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              try {
                return yield this.conn.tooling.query(url);
              } catch (error) {
                throw error;
              }
            }),
          { retries: 3, minTimeout: 2000 }
        );
      }
      return result;
    });
  }
}
exports.default = QueryExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlFeGVjdXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9xdWVyeUV4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXJDLE1BQXFCLGFBQWE7SUFDaEMsWUFBb0IsSUFBcUI7UUFBckIsU0FBSSxHQUFKLElBQUksQ0FBaUI7SUFBRyxDQUFDO0lBRWhDLFlBQVksQ0FBQyxLQUFhLEVBQUUsT0FBZ0I7O1lBQ3ZELElBQUksT0FBTyxDQUFDO1lBRVosSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUNuQixDQUFNLElBQUksRUFBQyxFQUFFO29CQUNYLElBQUk7d0JBQ0YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFRLENBQUM7cUJBQ3REO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNkLE1BQU0sS0FBSyxDQUFDO3FCQUNiO2dCQUNILENBQUMsQ0FBQSxFQUNELEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQ2pDLENBQUM7YUFDSDtpQkFBTTtnQkFDTCxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQ25CLENBQU0sSUFBSSxFQUFDLEVBQUU7b0JBQ1gsSUFBSTt3QkFDRixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBUSxDQUFDO3FCQUM5QztvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZCxNQUFNLEtBQUssQ0FBQztxQkFDYjtnQkFDSCxDQUFDLENBQUEsRUFDRCxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUNqQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDakIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7b0JBQ3BCLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDaEUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCxPQUFPLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQzthQUMvQjtZQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDO0tBQUE7SUFDWSxTQUFTLENBQUMsR0FBVyxFQUFFLE9BQWdCOztZQUNsRCxJQUFJLE1BQU0sQ0FBQztZQUNYLElBQUksT0FBTyxFQUFFO2dCQUNYLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FDbEIsQ0FBTSxJQUFJLEVBQUMsRUFBRTtvQkFDWCxJQUFJO3dCQUNGLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBUSxDQUFDO3FCQUN4RDtvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZCxNQUFNLEtBQUssQ0FBQztxQkFDYjtnQkFDSCxDQUFDLENBQUEsRUFDRCxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUNqQyxDQUFDO2FBQ0g7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUNsQixDQUFNLElBQUksRUFBQyxFQUFFO29CQUNYLElBQUk7d0JBQ0YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFRLENBQUM7cUJBQ3BEO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNkLE1BQU0sS0FBSyxDQUFDO3FCQUNiO2dCQUNILENBQUMsQ0FBQSxFQUNELEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQ2pDLENBQUM7YUFDSDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtDQUNGO0FBcEVELGdDQW9FQyJ9
