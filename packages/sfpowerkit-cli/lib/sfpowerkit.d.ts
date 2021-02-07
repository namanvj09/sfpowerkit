import { UX } from "@salesforce/command";
export declare enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}
export declare class SFPowerkit {
  private static defaultFolder;
  private static projectDirectories;
  private static pluginConfig;
  static isJsonFormatEnabled: boolean;
  private static ux;
  private static sourceApiVersion;
  private static logger;
  static logLevel: any;
  static setLogLevel(logLevel: string, isJsonFormatEnabled: boolean): void;
  static setProjectDirectories(packagedirectories: string[]): void;
  static getProjectDirectories(): Promise<string[]>;
  static getDefaultFolder(): Promise<string>;
  static setDefaultFolder(defaultFolder: string): void;
  static getConfig(): Promise<any>;
  static setapiversion(apiversion: any): void;
  static getApiVersion(): Promise<any>;
  /**
   * Print log only if the log level for this commamnd matches the log level for the message
   * @param message Message to print
   * @param messageLoglevel Log level for the message
   */
  static log(message: any, logLevel: LoggerLevel): void;
  static setUx(ux: UX): void;
  static setStatus(status: string): void;
}
