import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
export default class Create extends SfdxCommand {
  connectedapp_consumerKey: string;
  connectedapp_certificate: string;
  connectedapp_label: string;
  connectedapp_email: string;
  static description: string;
  static examples: string[];
  protected static flagsConfig: {
    name: flags.Discriminated<flags.Option<string>>;
    pathtocertificate: flags.Discriminated<flags.Option<string>>;
    email: flags.Discriminated<flags.Option<string>>;
    loglevel: flags.Discriminated<flags.Enum<string>>;
  };
  protected static requiresUsername: boolean;
  run(): Promise<AnyJson>;
  createConsumerKey(): string;
}
