"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSFDX = void 0;
const path = __importStar(require("path"));
const parallel_1 = require("./parallel");
function loadSFDX() {
  let salesforce_alm_path = "";
  try {
    salesforce_alm_path = path.dirname(require.resolve("salesforce-alm"));
  } catch (error) {
    console.log(error);
    throw error;
  }
  parallel_1.registerNamespace({
    commandsDir: path.join(salesforce_alm_path, "commands"),
    namespace: "force",
  });
}
exports.loadSFDX = loadSFDX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0Tm9kZVdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2ZkeG5vZGUvR2V0Tm9kZVdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUE2QjtBQUM3Qix5Q0FBK0M7QUFFL0MsU0FBZ0IsUUFBUTtJQUN0QixJQUFJLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztJQUM3QixJQUFJO1FBQ0YsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztLQUN2RTtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixNQUFNLEtBQUssQ0FBQztLQUNiO0lBRUQsNEJBQWlCLENBQUM7UUFDaEIsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDO1FBQ3ZELFNBQVMsRUFBRSxPQUFPO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUM7QUFiRCw0QkFhQyJ9
