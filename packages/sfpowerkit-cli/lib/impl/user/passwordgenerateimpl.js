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
const _ = require("lodash");
const queryExecutor_1 = __importDefault(require("../../utils/queryExecutor"));
const axios = require("axios");
// tslint:disable-next-line:ordered-imports
// eslint-disable-next-line no-useless-escape
const PASSWORD_LENGTH = 10;
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "1234567890";
const SYMBOLS = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "[",
  "]",
  "|",
  "-",
];
const ALL = [LOWER, UPPER, NUMBERS, SYMBOLS.join("")];
const rand = (len) => Math.floor(Math.random() * (len.length || len));
class Passwordgenerateimpl {
  static run(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let queryUtil = new queryExecutor_1.default(conn);
      const query = `SELECT id FROM User WHERE username = '${conn.getUsername()}'`;
      let userRecord = yield queryUtil.executeQuery(query, false);
      let pwd = this.generatePassword();
      let apiversion = yield conn.retrieveMaxApiVersion();
      let passwordStatus = false;
      var endpoint = `${conn.instanceUrl}/services/data/v${apiversion}/sobjects/User/${userRecord[0].Id}/password`;
      let data = JSON.stringify({ NewPassword: pwd });
      yield axios
        .post(endpoint, data, {
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          passwordStatus = response.status === 204;
        })
        .catch((error) => {
          passwordStatus = false;
        });
      let result = {
        username: conn.getUsername(),
        password: passwordStatus ? pwd : undefined,
      };
      return result;
    });
  }
  static generatePassword() {
    // Fill an array with random characters from random requirement sets
    const pass = Array(PASSWORD_LENGTH - ALL.length)
      .fill(1)
      .map(() => {
        const set = ALL[rand(ALL)];
        return set[rand(set)];
      });
    // Add at least one from each required set to meet minimum requirements
    ALL.forEach((set) => {
      pass.push(set[rand(set)]);
    });
    return _.shuffle(pass).join("");
  }
}
exports.default = Passwordgenerateimpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzc3dvcmRnZW5lcmF0ZWltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW1wbC91c2VyL3Bhc3N3b3JkZ2VuZXJhdGVpbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQTZCO0FBRTdCLDhFQUFpRDtBQUNqRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUU3QyxNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBTSxLQUFLLEdBQUcsNEJBQTRCLENBQUM7QUFDM0MsTUFBTSxLQUFLLEdBQUcsNEJBQTRCLENBQUM7QUFDM0MsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDO0FBQzdCLE1BQU0sT0FBTyxHQUFHO0lBQ2QsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0NBQ0osQ0FBQztBQUNGLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXRELE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUV0RSxNQUFxQixvQkFBb0I7SUFDaEMsTUFBTSxDQUFPLEdBQUcsQ0FBQyxJQUFnQjs7WUFDdEMsSUFBSSxTQUFTLEdBQUcsSUFBSSx1QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLE1BQU0sS0FBSyxHQUFHLHlDQUF5QyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQztZQUU3RSxJQUFJLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2xDLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDcEQsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzNCLElBQUksUUFBUSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsbUJBQW1CLFVBQVUsa0JBQWtCLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQztZQUM3RyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFaEQsTUFBTSxLQUFLO2lCQUNSLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFO2dCQUNwQixPQUFPLEVBQUU7b0JBQ1AsYUFBYSxFQUFFLFVBQVUsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDM0MsY0FBYyxFQUFFLGtCQUFrQjtpQkFDbkM7YUFDRixDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNqQixjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUM7WUFDM0MsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNmLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFTCxJQUFJLE1BQU0sR0FBRztnQkFDWCxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDNUIsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQzNDLENBQUM7WUFFRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFDRCxNQUFNLENBQUMsZ0JBQWdCO1FBQ3JCLG9FQUFvRTtRQUNwRSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNQLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDUixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFFTCx1RUFBdUU7UUFDdkUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRjtBQWpERCx1Q0FpREMifQ==
