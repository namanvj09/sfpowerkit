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
exports.checkDeploymentStatus = void 0;
const delay_1 = require("./delay");
const sfpowerkit_1 = require("../sfpowerkit");
const core_1 = require("@salesforce/core");
function checkDeploymentStatus(conn, retrievedId) {
  return __awaiter(this, void 0, void 0, function* () {
    let metadata_result;
    while (true) {
      yield conn.metadata.checkDeployStatus(
        retrievedId,
        true,
        function (error, result) {
          if (error) {
            throw new core_1.SfdxError(error.message);
          }
          metadata_result = result;
        }
      );
      if (!metadata_result.done) {
        sfpowerkit_1.SFPowerkit.log(
          "Polling for Deployment Status",
          core_1.LoggerLevel.INFO
        );
        yield delay_1.delay(5000);
      } else {
        break;
      }
    }
    return metadata_result;
  });
}
exports.checkDeploymentStatus = checkDeploymentStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tEZXBsb3ltZW50U3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NoZWNrRGVwbG95bWVudFN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBZ0M7QUFDaEMsOENBQTJDO0FBQzNDLDJDQUEwRDtBQUUxRCxTQUFzQixxQkFBcUIsQ0FDekMsSUFBZ0IsRUFDaEIsV0FBbUI7O1FBRW5CLElBQUksZUFBZSxDQUFDO1FBRXBCLE9BQU8sSUFBSSxFQUFFO1lBQ1gsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFDdkQsS0FBSyxFQUNMLE1BQU07Z0JBRU4sSUFBSSxLQUFLLEVBQUU7b0JBQ1QsTUFBTSxJQUFJLGdCQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3pCLHVCQUFVLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLGtCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xFLE1BQU0sYUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO2lCQUFNO2dCQUNMLE1BQU07YUFDUDtTQUNGO1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztDQUFBO0FBekJELHNEQXlCQyJ9
