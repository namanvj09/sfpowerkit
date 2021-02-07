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
exports.registerNamespace = exports.sfdx = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const builder_1 = require("./builder");
const types_1 = require("./types");
const createParallelCommand = (commandId, commandName, commandFile) => (
  flags,
  opts
) =>
  new Promise((resolve, reject) => {
    let child_path = __dirname.toString();
    if (path.basename(path.dirname(child_path)) == "src") {
      //Run in linking, ts is ran using ts-node, so use the compiled child.js
      //Linked
      child_path = path.join(
        path.dirname(path.dirname(child_path)),
        "lib",
        "sfdxnode"
      );
    }
    const child = child_process_1.fork(
      path.join(child_path, "./child.js"),
      ["--colors"],
      {
        cwd: flags.cwd ? flags.cwd.toString() : null,
      }
    );
    child.on("message", (message) => {
      if (message.type === "resolved") {
        resolve(message.value);
      } else if (message.type === "rejected") {
        reject(message.value);
      }
    });
    const childMsg = {
      commandFile,
      commandId,
      commandName,
      flags,
      opts,
    };
    child.send(childMsg);
  });
exports.sfdx = new types_1.SfdxApi();
function registerNamespace(sfdxNamespace) {
  const { commandsDir, namespace } = sfdxNamespace;
  exports.sfdx[namespace] = builder_1.buildCommands(
    createParallelCommand,
    commandsDir,
    namespace
  );
}
exports.registerNamespace = registerNamespace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYWxsZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2ZkeG5vZGUvcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFxQztBQUNyQywyQ0FBNkI7QUFDN0IsdUNBQTBDO0FBQzFDLG1DQU9pQjtBQUVqQixNQUFNLHFCQUFxQixHQUFzQixDQUMvQyxTQUFpQixFQUNqQixXQUFtQixFQUNuQixXQUFtQixFQUNuQixFQUFFLENBQUMsQ0FBQyxLQUFZLEVBQUUsSUFBVSxFQUFFLEVBQUUsQ0FDaEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDOUIsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ3BELHVFQUF1RTtRQUN2RSxRQUFRO1FBQ1IsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUN0QyxLQUFLLEVBQ0wsVUFBVSxDQUNYLENBQUM7S0FDSDtJQUNELE1BQU0sS0FBSyxHQUFHLG9CQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNwRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtLQUM3QyxDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQVksRUFBRSxFQUFFO1FBQ25DLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjthQUFNLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDdEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxRQUFRLEdBQW9CO1FBQ2hDLFdBQVc7UUFDWCxTQUFTO1FBQ1QsV0FBVztRQUNYLEtBQUs7UUFDTCxJQUFJO0tBQ0wsQ0FBQztJQUNGLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFFUSxRQUFBLElBQUksR0FBWSxJQUFJLGVBQU8sRUFBRSxDQUFDO0FBRTNDLFNBQWdCLGlCQUFpQixDQUFDLGFBQTRCO0lBQzVELE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLEdBQWtCLGFBQWEsQ0FBQztJQUNoRSxZQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsdUJBQWEsQ0FDN0IscUJBQXFCLEVBQ3JCLFdBQVcsRUFDWCxTQUFTLENBQ1YsQ0FBQztBQUNKLENBQUM7QUFQRCw4Q0FPQyJ9
