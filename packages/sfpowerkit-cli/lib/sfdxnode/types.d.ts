export declare class SfdxApi {
  [key: string]: any;
}
export declare class NsApi {
  [key: string]: any;
}
export interface SfdxNamespace {
  commandsDir: string;
  namespace: string;
}
export declare type Flags = {
  [key: string]: string | boolean | number | undefined | null;
};
export declare type Opts = string | string[];
export interface SfdxCommandDefinition {
  commandId: string;
  commandName: string;
  commandFile: string;
}
export interface SfdxNodeMessage {
  commandId: string;
  commandName: string;
  commandFile: string;
  flags: Flags;
  opts: Opts;
}
export interface SfdxNodeError {
  message: string;
  stack?: string;
}
export declare type CreateCommandFunc = (
  commandId: string,
  commandName: string,
  commandFile: string
) => (flags: Flags, opts: Opts) => Promise<any>;
