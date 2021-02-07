export interface ObjectOption {
  [key: string]: string | boolean | number | undefined | null;
}
export declare type Option = ObjectOption | string;
export declare type Options = Option | Option[];
export declare type TransformOption = (opt: ObjectOption) => string[];
export interface ArgsObject {
  args: string[];
  cwd?: string;
  printCommand?: boolean;
  quiet?: boolean;
}
/**
 * Global command options.
 * Used for every execution on the command instance.
 * Can be overridden with first exec option.
 *
 * @see {Option}
 */
export interface CommandOptions {
  cwd?: string;
  printCommand?: boolean;
  quiet?: boolean;
}
/**
 * Create a new command.
 *
 * @param name of the command
 * @param options the command options
 */
export declare function cmd(name: string, options?: CommandOptions): Command;
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
export declare function build(name: string, ...options: Options[]): string;
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
export declare function buildArgs(...options: Options[]): string[];
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
export declare function exec(name: string, ...options: Options[]): Promise<any>;
/**
 * The command class.
 *
 * Includes methods build and exec.
 */
export declare class Command {
  transform: TransformOption;
  private readonly _name;
  private readonly _options;
  constructor(name: string, options?: CommandOptions);
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
  build(...options: Options[]): string;
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
  buildArgs(...options: Options[]): string[];
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
  exec(...options: Options[]): Promise<any>;
}
