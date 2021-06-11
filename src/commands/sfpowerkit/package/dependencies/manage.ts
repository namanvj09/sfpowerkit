import { core, flags, SfdxCommand } from "@salesforce/command";
import { SfdxError, Connection } from "@salesforce/core";
import fs = require('fs');

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages(
  "sfpowerkit",
  "dependency_manage"
);

export default class Manage extends SfdxCommand {
    public static description = messages.getMessage("commandDescription");
  
    public static examples = [
      `$ sfdx sfpowerkit:dependency:tree:manage -v myDevHubOrg@example.com`,
    ];

    protected static flagsConfig = {
      filterpaths: flags.array({
        char: "p",
        required: false,
        description: messages.getMessage("filterpathsDescription"),
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
        ],
      }),
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = true;

    // Comment this out if your command does not require a hub org username
    protected static requiresDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    /**
     * Is your feature request related to a problem? Please describe.
        On a large scale project, when delivered using mono repo, the number of packages are very high, mostly 30+ with dependencies on many other packages. Updating dependencies manually is very hard, especially when there is a breaking change in a package that is way up in the dependency tree, one has to carefully update dependencies one by one.

        Describe the solution you'd like
        A clear and concise description of what you want to happen.

        An inquirer based guided experience would nice to have with option provided for developers to update all dependendency at once or selective packages by displaying the dependency of the particular package
     */
    public async run(): Promise<any> {
      //list dependencies
      //ask if want to update each dependency individually or update all dependencies
      //if individually - loop through and for each package dependency, ask if minor or major version to be updated  

      let projectConfig = JSON.parse(
        fs.readFileSync("sfdx-project.json", "utf8")
      );

      for(let packageDirectory of projectConfig.packageDirectories){
        console.log(packageDirectory);
      }
      return; 

    }

  }