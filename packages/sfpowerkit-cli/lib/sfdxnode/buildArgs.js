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
exports.Command = exports.exec = exports.buildArgs = exports.build = exports.cmd = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
/**
 * Create a new command.
 *
 * @param name of the command
 * @param options the command options
 */
function cmd(name, options = {}) {
  return new Command(name, options);
}
exports.cmd = cmd;
/**
 * Build a command as a string without executing it.
 *
 * Examples:
 *
 * build('npm', {version: true});
 *
 * build('java', '-version');
 *
 * @param name of the command
 * @param options the command options
 */
function build(name, ...options) {
  return cmd(name).build(...options);
}
exports.build = build;
/**
 * Build command args as a string array without executing it.
 *
 * Examples:
 *
 * buildArgs({version: true});
 *
 * buildArgs('-version');
 *
 * @param options the command options
 */
function buildArgs(...options) {
  return cmd("").buildArgs(...options);
}
exports.buildArgs = buildArgs;
/**
 * Execute a command.
 *
 * Examples:
 *
 * exec('npm', {version: true});
 *
 * exec('java', '-version');
 *
 * @param name of the command
 * @param options the command options
 */
function exec(name, ...options) {
  return __awaiter(this, void 0, void 0, function* () {
    return cmd(name).exec(...options);
  });
}
exports.exec = exec;
/**
 * The command class.
 *
 * Includes methods build and exec.
 */
class Command {
  constructor(name, options = {}) {
    this.transform = defaultTransform;
    this._name = name;
    this._options = Object.assign(
      { cwd: process.cwd(), printCommand: true, quiet: false },
      options
    );
  }
  /**
   * Build the command as a string without executing it.
   *
   * Examples:
   *
   * cmd('npm').build({version: true});
   *
   * cmd('java').build('-version');
   *
   * @param options the command options
   */
  build(...options) {
    const argsObj = transformOptions(options, this.transform);
    return `${this._name} ${argsObj.args.join(" ")}`;
  }
  /**
   * Build command args as a string array without executing it.
   *
   * Examples:
   *
   * cmd('npm').buildArgs({version: true});
   *
   * cmd('java').buildArgs('-version');
   *
   * @param options the command options
   */
  buildArgs(...options) {
    return transformOptions(options, this.transform).args;
  }
  /**
   * Execute the command.
   *
   * Examples:
   *
   * cmd('npm').exec({version: true});
   *
   * cmd('java').exec('-version');
   *
   * @param options the command options
   */
  exec(...options) {
    return __awaiter(this, void 0, void 0, function* () {
      const argsObj = transformOptions(options, this.transform);
      const quiet = isBoolean(argsObj.quiet)
        ? argsObj.quiet
        : this._options.quiet;
      const printCommand = isBoolean(argsObj.printCommand)
        ? argsObj.printCommand
        : this._options.printCommand;
      const cwd = argsObj.cwd ? argsObj.cwd : this._options.cwd;
      const execCommand = `${this._name} ${argsObj.args.join(" ")}`;
      if (!quiet && printCommand) {
        console.log(`$ ${execCommand}`);
      }
      return spawnProcess(this._name, argsObj.args, quiet, cwd);
    });
  }
}
exports.Command = Command;
const isBoolean = (it) => [true, false].includes(it);
function isPlainObject(o) {
  return typeof o === "object" && o.constructor === Object;
}
function spawnProcess(bin, args, quiet, cwd) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      const spawnOptions = {
        cwd,
      };
      if (!quiet) {
        spawnOptions.stdio = "inherit";
      }
      const spawned = child_process_1.spawn(bin, args, spawnOptions);
      spawned.on("exit", (exitCode) => {
        exitCode === 0
          ? resolve()
          : reject(new Error(`Exit with code: ${exitCode}`));
      });
      spawned.on("error", (err) => {
        try {
          fs.statSync(cwd);
        } catch (e) {
          if (e.code === "ENOENT") {
            reject(`The specified cwd does not exist: ${cwd}`);
          }
        }
        reject(err);
      });
    });
  });
}
function transformOptions(options, transform) {
  const argsObj = {
    args: [],
  };
  options.forEach((opt, idx) => {
    if (Array.isArray(opt)) {
      opt.forEach((it) => {
        if (isPlainObject(it)) {
          argsObj.args.push(...defaultTransform(it));
        } else if (typeof it === "string") {
          argsObj.args.push(it);
        }
      });
    } else if (isPlainObject(opt)) {
      if (idx === 0) {
        const transformed = transformFirstOption(opt, transform);
        argsObj.args.push(...transformed.args);
        argsObj.cwd = transformed.cwd;
        argsObj.printCommand = transformed.printCommand;
        argsObj.quiet = transformed.quiet;
      } else {
        argsObj.args.push(...defaultTransform(opt));
      }
    } else if (typeof opt === "string") {
      argsObj.args.push(opt);
    }
  });
  return argsObj;
}
function transformFirstOption(opt, transform) {
  const argsObj = {
    args: [],
  };
  const filteredOption = {};
  Object.entries(opt).forEach(([flagName, flagValue]) => {
    if (flagName === "quiet") {
      argsObj.quiet = flagValue === true;
    } else if (flagName === "printCommand") {
      argsObj.printCommand = flagValue === true;
    } else if (flagName === "cwd") {
      argsObj.cwd = flagValue.toString();
    } else {
      filteredOption[flagName] = flagValue;
    }
  });
  argsObj.args.push(...transform(filteredOption));
  return argsObj;
}
function defaultTransform(opt) {
  const args = [];
  Object.entries(opt).forEach(([flagName, flagValue]) => {
    if (isBoolean(flagValue)) {
      if (flagValue === true) {
        if (flagName.length === 1) {
          args.push(`-${flagName}`);
        } else {
          args.push(`--${flagName}`);
        }
      }
    } else if (flagValue) {
      if (flagName.length === 1) {
        args.push(`-${flagName}`, `${flagValue}`);
      } else {
        args.push(`--${flagName}`, `${flagValue}`);
      }
    }
  });
  return args;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRBcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NmZHhub2RlL2J1aWxkQXJncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW9EO0FBQ3BELDZDQUErQjtBQWdDL0I7Ozs7O0dBS0c7QUFDSCxTQUFnQixHQUFHLENBQUMsSUFBWSxFQUFFLFVBQTBCLEVBQUU7SUFDNUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUZELGtCQUVDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxTQUFnQixLQUFLLENBQUMsSUFBWSxFQUFFLEdBQUcsT0FBa0I7SUFDdkQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUZELHNCQUVDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxHQUFHLE9BQWtCO0lBQzdDLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFGRCw4QkFFQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBc0IsSUFBSSxDQUFDLElBQVksRUFBRSxHQUFHLE9BQWtCOztRQUM1RCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQUE7QUFGRCxvQkFFQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFhLE9BQU87SUFLbEIsWUFBWSxJQUFZLEVBQUUsVUFBMEIsRUFBRTtRQUovQyxjQUFTLEdBQW9CLGdCQUFnQixDQUFDO1FBS25ELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLG1C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
