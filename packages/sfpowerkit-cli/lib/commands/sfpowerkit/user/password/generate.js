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
const sfpowerkit_1 = require("../../../../sfpowerkit");
const passwordgenerateimpl_1 = __importDefault(
  require("../../../../impl/user/passwordgenerateimpl")
);
const core_1 = require("@salesforce/core");
class Generate extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      //Connect to the org
      yield this.org.refreshAuth();
      const conn = this.org.getConnection();
      let result = yield passwordgenerateimpl_1.default.run(conn);
      if (!result.password) {
        throw new core_1.SfdxError(
          `Error occured unable to set password at the moment, please try later.`
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        `Password successfully set for ${result.username} : ${result.password}`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      return result;
    });
  }
}
exports.default = Generate;
Generate.description =
  "Generates password for a given user in a salesforce org.";
Generate.examples = [`$ sfdx sfpowerkit:user:password:generate -u sandbox1`];
Generate.flagsConfig = {
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
// Comment this out if your command does not require a hub org username
Generate.requiresUsername = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC91c2VyL3Bhc3N3b3JkL2dlbmVyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQXlEO0FBRXpELHVEQUFpRTtBQUNqRSxzR0FBOEU7QUFDOUUsMkNBQTZDO0FBRTdDLE1BQXFCLFFBQVMsU0FBUSxxQkFBVztJQWdDbEMsR0FBRzs7WUFDZCx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELG9CQUFvQjtZQUNwQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV0QyxJQUFJLE1BQU0sR0FBRyxNQUFNLDhCQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLGdCQUFTLENBQ2pCLHVFQUF1RSxDQUN4RSxDQUFDO2FBQ0g7WUFFRCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixpQ0FBaUMsTUFBTSxDQUFDLFFBQVEsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ3ZFLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO1lBRUYsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztLQUFBOztBQXJESCwyQkFzREM7QUFyRGUsb0JBQVcsR0FDdkIsMERBQTBELENBQUM7QUFFL0MsaUJBQVEsR0FBRztJQUN2QixzREFBc0Q7Q0FDdkQsQ0FBQztBQUVlLG9CQUFXLEdBQUc7SUFDN0IsUUFBUSxFQUFFLGVBQUssQ0FBQyxJQUFJLENBQUM7UUFDbkIsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1I7S0FDRixDQUFDO0NBQ0gsQ0FBQztBQUNGLHVFQUF1RTtBQUN0RCx5QkFBZ0IsR0FBRyxJQUFJLENBQUMifQ==
