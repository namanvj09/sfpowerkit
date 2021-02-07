"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const cli_ux_1 = __importDefault(require("cli-ux"));
const util_1 = require("util");
const sfpowerkit_1 = require("../sfpowerkit");
class ProgressBar {
  create(title, unit, displayTillLogLevel) {
    if (
      sfpowerkit_1.SFPowerkit.logLevel <= displayTillLogLevel &&
      !sfpowerkit_1.SFPowerkit.isJsonFormatEnabled
    ) {
      this.progressBarImpl = cli_ux_1.default.progress({
        format: `${title} - PROGRESS  | {bar} | {value}/{total} ${unit}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        linewrap: true,
      });
    }
    return this;
  }
  start(totalSize) {
    if (!util_1.isNullOrUndefined(this.progressBarImpl))
      this.progressBarImpl.start(totalSize);
  }
  stop() {
    if (!util_1.isNullOrUndefined(this.progressBarImpl))
      this.progressBarImpl.stop();
  }
  increment(count) {
    if (!util_1.isNullOrUndefined(this.progressBarImpl))
      this.progressBarImpl.increment(count);
  }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3NCYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdWkvcHJvZ3Jlc3NCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0RBQXlCO0FBQ3pCLCtCQUF5QztBQUN6Qyw4Q0FBMkM7QUFFM0MsTUFBYSxXQUFXO0lBR2YsTUFBTSxDQUNYLEtBQWEsRUFDYixJQUFZLEVBQ1osbUJBQTJCO1FBRTNCLElBQ0UsdUJBQVUsQ0FBQyxRQUFRLElBQUksbUJBQW1CO1lBQzFDLENBQUMsdUJBQVUsQ0FBQyxtQkFBbUIsRUFDL0I7WUFDQSxJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFHLENBQUMsUUFBUSxDQUFDO2dCQUNsQyxNQUFNLEVBQUUsR0FBRyxLQUFLLDBDQUEwQyxJQUFJLEVBQUU7Z0JBQ2hFLGVBQWUsRUFBRSxRQUFRO2dCQUN6QixpQkFBaUIsRUFBRSxRQUFRO2dCQUMzQixRQUFRLEVBQUUsSUFBSTthQUNmLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU0sS0FBSyxDQUFDLFNBQWlCO1FBQzVCLElBQUksQ0FBQyx3QkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQzFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxJQUFJO1FBQ1QsSUFBSSxDQUFDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVFLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsd0JBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUMxQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0Y7QUFuQ0Qsa0NBbUNDIn0=
