/// <reference types="node" />
import { AnyJson } from "@salesforce/ts-types";
import { flags, SfdxCommand } from "@salesforce/command";
export default class Login extends SfdxCommand {
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    username: flags.Discriminated<flags.Option<string>>;
    password: flags.Discriminated<flags.Option<string>>;
    securitytoken: flags.Discriminated<flags.Option<string>>;
    url: flags.Discriminated<flags.Option<import("url").URL>>;
    alias: flags.Discriminated<flags.Option<string>>;
  };
  loginUrl: string;
  password: string;
  run(): Promise<AnyJson>;
}
