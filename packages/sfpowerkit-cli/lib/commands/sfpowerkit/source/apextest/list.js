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
const fs_1 = require("fs");
const command_1 = require("@salesforce/command");
const sfpowerkit_1 = require("../../../../sfpowerkit");
const core_1 = require("@salesforce/core");
const ApexTypeFetcher_1 = __importDefault(
  require("../../../../impl/parser/ApexTypeFetcher")
);
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "source_apextest_list"
);
class List extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.setLogLevel(this.flags.loglevel, this.flags.json);
      //set apex class directory
      if (!fs_1.existsSync(this.flags.path)) {
        throw new core_1.SfdxError(
          `path ${this.flags.path} does not exist. you must provide a valid path.`
        );
      }
      let apexTypeFetcher = new ApexTypeFetcher_1.default();
      let apexSortedByType = apexTypeFetcher.getApexTypeOfClsFiles(
        this.flags.path
      );
      let testClasses = apexSortedByType["testClass"];
      let testClassesList = testClasses.map((cls) => cls.name);
      if (testClasses.length > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `Found ${testClasses.length} apex test classes in ${this.flags.path}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
        if (this.flags.resultasstring) {
          this.ux.log(testClassesList.join(","));
        } else {
          this.ux.table(testClasses, ["name", "filepath"]);
        }
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `No apex test classes found in ${this.flags.path}`,
          sfpowerkit_1.LoggerLevel.INFO
        );
      }
      return this.flags.resultasstring
        ? testClassesList.join(",")
        : testClassesList;
    });
  }
}
exports.default = List;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
List.requiresProject = true;
List.description = messages.getMessage("commandDescription");
List.examples = [`$ sfdx sfpowerkit:source:apextest:list -p force-app`];
List.flagsConfig = {
  path: command_1.flags.string({
    required: true,
    char: "p",
    description: messages.getMessage("pathFlagDescription"),
  }),
  resultasstring: command_1.flags.boolean({
    description: messages.getMessage("resultasstringDescription"),
    required: false,
  }),
  loglevel: command_1.flags.enum({
    description: messages.getMessage("loglevel"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21tYW5kcy9zZnBvd2Vya2l0L3NvdXJjZS9hcGV4dGVzdC9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkJBQWdDO0FBQ2hDLGlEQUErRDtBQUMvRCx1REFBaUU7QUFDakUsMkNBQTZDO0FBQzdDLDhGQUVpRDtBQUVqRCx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN6QyxZQUFZLEVBQ1osc0JBQXNCLENBQ3ZCLENBQUM7QUFFRixNQUFxQixJQUFLLFNBQVEscUJBQVc7SUF3QzlCLEdBQUc7O1lBQ2QsdUJBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLGVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksZ0JBQVMsQ0FDakIsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksaURBQWlELENBQ3pFLENBQUM7YUFDSDtZQUVELElBQUksZUFBZSxHQUFvQixJQUFJLHlCQUFlLEVBQUUsQ0FBQztZQUM3RCxJQUFJLGdCQUFnQixHQUFxQixlQUFlLENBQUMscUJBQXFCLENBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUNoQixDQUFDO1lBRUYsSUFBSSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEQsSUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpELElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzFCLHVCQUFVLENBQUMsR0FBRyxDQUNaLFNBQVMsV0FBVyxDQUFDLE1BQU0seUJBQXlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQ3JFLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2dCQUNGLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7b0JBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDeEM7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQ2xEO2FBQ0Y7aUJBQU07Z0JBQ0wsdUJBQVUsQ0FBQyxHQUFHLENBQ1osaUNBQWlDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQ2xELHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYztnQkFDOUIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUMzQixDQUFDLENBQUMsZUFBZSxDQUFDO1FBQ3RCLENBQUM7S0FBQTs7QUE5RUgsdUJBK0VDO0FBOUVDLHVHQUF1RztBQUN0RixvQkFBZSxHQUFHLElBQUksQ0FBQztBQUMxQixnQkFBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV4RCxhQUFRLEdBQUc7SUFDdkIscURBQXFEO0NBQ3RELENBQUM7QUFFZSxnQkFBVyxHQUFHO0lBQzdCLElBQUksRUFBRSxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2pCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztLQUN4RCxDQUFDO0lBQ0YsY0FBYyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUM7UUFDNUIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQUM7UUFDN0QsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUNGLFFBQVEsRUFBRSxlQUFLLENBQUMsSUFBSSxDQUFDO1FBQ25CLFdBQVcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sTUFBTTtZQUNOLE9BQU87WUFDUCxPQUFPO1NBQ1I7S0FDRixDQUFDO0NBQ0gsQ0FBQyJ9
