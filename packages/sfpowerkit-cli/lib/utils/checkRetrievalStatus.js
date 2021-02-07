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
exports.checkRetrievalStatus = void 0;
const delay_1 = require("./delay");
const sfpowerkit_1 = require("../sfpowerkit");
const core_1 = require("@salesforce/core");
function checkRetrievalStatus(conn, retrievedId, isToBeLoggedToConsole = true) {
  return __awaiter(this, void 0, void 0, function* () {
    let metadata_result;
    while (true) {
      yield conn.metadata.checkRetrieveStatus(
        retrievedId,
        function (error, result) {
          if (error) {
            return new core_1.SfdxError(error.message);
          }
          metadata_result = result;
        }
      );
      if (metadata_result.done === "false") {
        if (isToBeLoggedToConsole)
          sfpowerkit_1.SFPowerkit.log(
            `Polling for Retrieval Status`,
            core_1.LoggerLevel.INFO
          );
        yield delay_1.delay(5000);
      } else {
        //this.ux.logJson(metadata_result);
        break;
      }
    }
    return metadata_result;
  });
}
exports.checkRetrievalStatus = checkRetrievalStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tSZXRyaWV2YWxTdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvY2hlY2tSZXRyaWV2YWxTdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQWdDO0FBQ2hDLDhDQUEyQztBQUMzQywyQ0FBMEQ7QUFFMUQsU0FBc0Isb0JBQW9CLENBQ3hDLElBQWdCLEVBQ2hCLFdBQW1CLEVBQ25CLHdCQUFpQyxJQUFJOztRQUVyQyxJQUFJLGVBQWUsQ0FBQztRQUVwQixPQUFPLElBQUksRUFBRTtZQUNYLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsVUFDbkQsS0FBSyxFQUNMLE1BQU07Z0JBRU4sSUFBSSxLQUFLLEVBQUU7b0JBQ1QsT0FBTyxJQUFJLGdCQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNyQztnQkFDRCxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxlQUFlLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDcEMsSUFBSSxxQkFBcUI7b0JBQ3ZCLHVCQUFVLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLGtCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sYUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO2lCQUFNO2dCQUNMLG1DQUFtQztnQkFDbkMsTUFBTTthQUNQO1NBQ0Y7UUFDRCxPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0NBQUE7QUE1QkQsb0RBNEJDIn0=
