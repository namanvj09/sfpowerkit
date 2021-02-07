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
exports.getUserEmail = void 0;
const util_1 = require("util");
const sfpowerkit_1 = require("../sfpowerkit");
let retry = require("async-retry");
function getUserEmail(username, hubOrg) {
  return __awaiter(this, void 0, void 0, function* () {
    let hubConn = hubOrg.getConnection();
    return yield retry(
      (bail) =>
        __awaiter(this, void 0, void 0, function* () {
          if (util_1.isNullOrUndefined(username)) {
            bail(
              new Error("username cannot be null. provide a valid username")
            );
            return;
          }
          let query = `SELECT email FROM user WHERE username='${username}'`;
          sfpowerkit_1.SFPowerkit.log(
            "QUERY:" + query,
            sfpowerkit_1.LoggerLevel.TRACE
          );
          const results = yield hubConn.query(query);
          if (results.records.size < 1) {
            bail(
              new Error(`No user found with username ${username} in devhub.`)
            );
            return;
          }
          return results.records[0].Email;
        }),
      { retries: 3, minTimeout: 3000 }
    );
  });
}
exports.getUserEmail = getUserEmail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VXNlckRldGFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZ2V0VXNlckRldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsK0JBQXlDO0FBQ3pDLDhDQUF3RDtBQUN4RCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFbkMsU0FBc0IsWUFBWSxDQUFDLFFBQWdCLEVBQUUsTUFBVzs7UUFDOUQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJDLE9BQU8sTUFBTSxLQUFLLENBQ2hCLENBQU0sSUFBSSxFQUFDLEVBQUU7WUFDWCxJQUFJLHdCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxPQUFPO2FBQ1I7WUFDRCxJQUFJLEtBQUssR0FBRywwQ0FBMEMsUUFBUSxHQUFHLENBQUM7WUFFbEUsdUJBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssRUFBRSx3QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFRLENBQUM7WUFFcEQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQywrQkFBK0IsUUFBUSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPO2FBQ1I7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUMsQ0FBQSxFQUNELEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQ2pDLENBQUM7SUFDSixDQUFDO0NBQUE7QUF0QkQsb0NBc0JDIn0=
