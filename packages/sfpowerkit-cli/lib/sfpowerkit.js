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
exports.SFPowerkit = exports.LoggerLevel = void 0;
const core_1 = require("@salesforce/core");
const util_1 = require("util");
const Logger = require("pino");
var LoggerLevel;
(function (LoggerLevel) {
  LoggerLevel[(LoggerLevel["TRACE"] = 10)] = "TRACE";
  LoggerLevel[(LoggerLevel["DEBUG"] = 20)] = "DEBUG";
  LoggerLevel[(LoggerLevel["INFO"] = 30)] = "INFO";
  LoggerLevel[(LoggerLevel["WARN"] = 40)] = "WARN";
  LoggerLevel[(LoggerLevel["ERROR"] = 50)] = "ERROR";
  LoggerLevel[(LoggerLevel["FATAL"] = 60)] = "FATAL";
})((LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {})));
class SFPowerkit {
  static setLogLevel(logLevel, isJsonFormatEnabled) {
    logLevel = logLevel.toLowerCase();
    this.isJsonFormatEnabled = isJsonFormatEnabled;
    if (!isJsonFormatEnabled) {
      SFPowerkit.logger = Logger({
        name: "sfpowerkit",
        level: logLevel,
        prettyPrint: {
          levelFirst: true,
          colorize: true,
          translateTime: true,
          ignore: "pid,hostname", // --ignore
        },
      });
    } else {
      //do nothing for now, need to put pino to move to file
    }
    switch (logLevel) {
      case "trace":
        SFPowerkit.logLevel = LoggerLevel.TRACE;
        break;
      case "debug":
        SFPowerkit.logLevel = LoggerLevel.DEBUG;
        break;
      case "info":
        SFPowerkit.logLevel = LoggerLevel.INFO;
        break;
      case "warn":
        SFPowerkit.logLevel = LoggerLevel.WARN;
        break;
      case "error":
        SFPowerkit.logLevel = LoggerLevel.ERROR;
        break;
      case "fatal":
        SFPowerkit.logLevel = LoggerLevel.FATAL;
        break;
    }
  }
  static setProjectDirectories(packagedirectories) {
    SFPowerkit.projectDirectories = packagedirectories;
  }
  static getProjectDirectories() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!SFPowerkit.projectDirectories) {
        SFPowerkit.projectDirectories = [];
        const dxProject = yield core_1.SfdxProject.resolve();
        const project = yield dxProject.retrieveSfdxProjectJson();
        let packages = project.get("packageDirectories") || [];
        packages.forEach((element) => {
          SFPowerkit.projectDirectories.push(element.path);
          if (element.default) {
            SFPowerkit.defaultFolder = element.path;
          }
        });
      }
      return SFPowerkit.projectDirectories;
    });
  }
  static getDefaultFolder() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!SFPowerkit.defaultFolder) {
        yield SFPowerkit.getProjectDirectories();
      }
      return SFPowerkit.defaultFolder;
    });
  }
  static setDefaultFolder(defaultFolder) {
    SFPowerkit.defaultFolder = defaultFolder;
  }
  static getConfig() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!SFPowerkit.pluginConfig) {
        const dxProject = yield core_1.SfdxProject.resolve();
        const project = yield dxProject.retrieveSfdxProjectJson();
        let plugins = project.get("plugins") || {};
        let sfpowerkitConfig = plugins["sfpowerkit"];
        SFPowerkit.pluginConfig = sfpowerkitConfig || {};
      }
      return SFPowerkit.pluginConfig;
    });
  }
  static setapiversion(apiversion) {
    SFPowerkit.sourceApiVersion = apiversion;
  }
  static getApiVersion() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!SFPowerkit.sourceApiVersion) {
        const dxProject = yield core_1.SfdxProject.resolve();
        const project = yield dxProject.retrieveSfdxProjectJson();
        SFPowerkit.sourceApiVersion = project.get("sourceApiVersion");
      }
      return SFPowerkit.sourceApiVersion;
    });
  }
  /**
   * Print log only if the log level for this commamnd matches the log level for the message
   * @param message Message to print
   * @param messageLoglevel Log level for the message
   */
  static log(message, logLevel) {
    if (util_1.isNullOrUndefined(this.logger)) return;
    if (this.isJsonFormatEnabled) return;
    switch (logLevel) {
      case LoggerLevel.TRACE:
        this.logger.trace(message);
        break;
      case LoggerLevel.DEBUG:
        this.logger.debug(message);
        break;
      case LoggerLevel.INFO:
        this.logger.info(message);
        break;
      case LoggerLevel.WARN:
        this.logger.warn(message);
        break;
      case LoggerLevel.ERROR:
        this.logger.error(message);
        break;
      case LoggerLevel.FATAL:
        this.logger.fatal(message);
        break;
    }
  }
  static setUx(ux) {
    this.ux = ux;
  }
  static setStatus(status) {
    this.ux.setSpinnerStatus(status);
  }
}
exports.SFPowerkit = SFPowerkit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Zwb3dlcmtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZnBvd2Vya2l0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJDQUErQztBQUMvQywrQkFBeUM7QUFHekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLElBQVksV0FPWDtBQVBELFdBQVksV0FBVztJQUNyQixnREFBVSxDQUFBO0lBQ1YsZ0RBQVUsQ0FBQTtJQUNWLDhDQUFTLENBQUE7SUFDVCw4Q0FBUyxDQUFBO0lBQ1QsZ0RBQVUsQ0FBQTtJQUNWLGdEQUFVLENBQUE7QUFDWixDQUFDLEVBUFcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFPdEI7QUFDRCxNQUFhLFVBQVU7SUFVZCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQWdCLEVBQUUsbUJBQTRCO1FBQ3RFLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN4QixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDekIsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLEtBQUssRUFBRSxRQUFRO2dCQUNmLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsUUFBUSxFQUFFLElBQUk7b0JBQ2QsYUFBYSxFQUFFLElBQUk7b0JBQ25CLE1BQU0sRUFBRSxjQUFjLENBQUMsV0FBVztpQkFDbkM7YUFDRixDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsc0RBQXNEO1NBQ3ZEO1FBQ0QsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxPQUFPO2dCQUNWLFVBQVUsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztnQkFDeEMsTUFBTTtZQUNSLEtBQUssT0FBTztnQkFDVixVQUFVLENB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
