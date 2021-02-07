import { CreateCommandFunc, NsApi } from "./types";
export declare function buildCommands(
  createCommand: CreateCommandFunc,
  moduleDir: string,
  namespace: string
): NsApi;
