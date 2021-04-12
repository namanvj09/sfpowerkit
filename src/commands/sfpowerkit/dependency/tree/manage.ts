import { core, flags, SfdxCommand } from "@salesforce/command";
import { SfdxError, Connection } from "@salesforce/core";


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages(
  "sfpowerkit",
  "dependency_tree_package"
);

export default class manage extends SfdxCommand {
    public connectedapp_consumerKey: string;
    public connectedapp_certificate: string;
    public connectedapp_label: string;
    public connectedapp_email: string;
  
    public static description = messages.getMessage("commandDescription");
  
    public static examples = [
      `$ sfdx sfpowerkit:dependency:tree:manage -u myOrg@example.com 
    `
    ];
  
    protected static flagsConfig = {
      name: flags.string({
        required: true,
        char: "n",
        description: messages.getMessage("nameFlagDescription")
      }),

      loglevel: flags.enum({
        description: "logging level for this command invocation",
        default: "info",
        required: false,
        options: [
          "trace",
          "debug",
          "info",
          "warn",
          "error",
          "fatal",
          "TRACE",
          "DEBUG",
          "INFO",
          "WARN",
          "ERROR",
          "FATAL"
        ]
      })
    };

    public async run(): Promise<any> {}}