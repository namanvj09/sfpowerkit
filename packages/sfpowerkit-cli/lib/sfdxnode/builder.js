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
exports.buildCommands = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const pascalCase = (it) =>
  it
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
function preprocessCommandsDir(commandsDir, namespace, parts) {
  const cmdArray = [];
  const dir = path.join(commandsDir, ...parts);
  fs.readdirSync(dir)
    .sort((a, b) => {
      const statA = fs.statSync(path.join(dir, a));
      const statB = fs.statSync(path.join(dir, b));
      return statA.isFile() === statB.isFile()
        ? 0
        : statA.isFile() <= statB.isFile()
        ? 1
        : -1;
    })
    .forEach((fileOrDir) => {
      const commandFile = path.join(dir, fileOrDir);
      const fileNameWithoutExt = fileOrDir.replace(".js", "");
      const newParts = [...parts, fileNameWithoutExt];
      const stat = fs.statSync(commandFile);
      if (stat.isFile()) {
        if (newParts.length > 0 && path.extname(commandFile) === ".js") {
          cmdArray.push({
            commandFile,
            commandId: [namespace, ...newParts].join(":"),
            commandName: pascalCase([...newParts, "command"]),
          });
        }
      } else if (stat.isDirectory()) {
        cmdArray.push(
          ...preprocessCommandsDir(commandsDir, namespace, newParts)
        );
      }
    });
  return cmdArray;
}
function processBaseCommand(moduleDir, namespace) {
  if (fs.existsSync(path.join(moduleDir, `${namespace}.js`))) {
    return {
      commandFile: path.join(moduleDir, `${namespace}.js`),
      commandId: namespace,
      commandName: pascalCase([namespace, "command"]),
    };
  }
}
function buildCommands(createCommand, moduleDir, namespace) {
  const base = processBaseCommand(moduleDir, namespace);
  const nsApi = base
    ? createCommand(base.commandId, base.commandName, base.commandFile)
    : {};
  preprocessCommandsDir(path.join(moduleDir, namespace), namespace, []).forEach(
    ({ commandId, commandName, commandFile }) => {
      const parts = commandId.split(":").slice(1);
      parts.reduce((api, part) => {
        if (!api.hasOwnProperty(part)) {
          if (parts[parts.length - 1] === part) {
            api[part] = createCommand(commandId, commandName, commandFile);
          } else {
            api[part] = {};
          }
        }
        return api[part];
      }, nsApi);
    }
  );
  return nsApi;
}
exports.buildCommands = buildCommands;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZmR4bm9kZS9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBRzdCLE1BQU0sVUFBVSxHQUFHLENBQUMsRUFBWSxFQUFFLEVBQUUsQ0FDbEMsRUFBRTtLQUNDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDbEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRWQsU0FBUyxxQkFBcUIsQ0FDNUIsV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsS0FBZTtJQUVmLE1BQU0sUUFBUSxHQUE0QixFQUFFLENBQUM7SUFDN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUM3QyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztTQUNoQixJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUU7UUFDN0IsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDLENBQUM7U0FDRCxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtRQUNyQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5QyxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pCLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBQzlELFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ1osV0FBVztvQkFDWCxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUM3QyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQ2xELENBQUMsQ0FBQzthQUNKO1NBQ0Y7YUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM3QixRQUFRLENBQUMsSUFBSSxDQUNYLEdBQUcscUJBQXFCLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FDM0QsQ0FBQztTQUNIO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FDekIsU0FBaUIsRUFDakIsU0FBaUI7SUFFakIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzFELE9BQU87WUFDTCxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxTQUFTLEtBQUssQ0FBQztZQUNwRCxTQUFTLEVBQUUsU0FBUztZQUNwQixXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ2hELENBQUM7S0FDSDtBQUNILENBQUM7QUFFRCxTQUFnQixhQUFhLENBQzNCLGFBQWdDLEVBQ2hDLFNBQWlCLEVBQ2pCLFNBQWlCO0lBRWpCLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN0RCxNQUFNLEtBQUssR0FBVSxJQUFJO1FBQ3ZCLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbkUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNQLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQzNFLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBeUIsRUFBRSxFQUFFO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFRLEVBQUUsSUFBWSxFQUFFLEVBQUU7WUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNwQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2hFO3FCQUFNO29CQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQ2hCO2FBQ0Y7WUFDRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDWixDQUFDLENBQ0YsQ0FBQztJQUNGLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQXpCRCxzQ0F5QkMifQ==
