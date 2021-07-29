import { core, flags, SfdxCommand } from "@salesforce/command";
import { SfdxError, Connection } from "@salesforce/core";
import { cli } from "cli-ux";
import fs = require("fs");
import { replace } from "lodash";

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages("sfpowerkit", "dependency_manage");

export default class Manage extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

  public static examples = [`$ sfdx sfpowerkit:package:dependencies:manage`];

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
        "FATAL",
      ],
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not require a hub org username
  protected static requiresDevhubUsername = false;

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

    let replacement = `{\"packageDirectories\": [`; 

    this.ux.log(
      `There are ${projectConfig.packageDirectories.length} packages in the given sfdx-project.json file`
    );
    for (let packageDirectory of projectConfig.packageDirectories) {
      let YNinput = await this.yesNoInput(
        `Would you like to increase the version of ${packageDirectory.package} [y/n/q]`
      );
      if (YNinput == "y") {
        let versionInput: string = await cli.prompt(
          `Input the version number E.g. 10.0.1.1`
        );
        if (!this.checkVersionInput(versionInput)) {
          this.ux.log();
        }
        replacement += 
          JSON.stringify(packageDirectory),
          function (key, value) {
            if (key == "versionNumber") {
              return versionInput;
            } else {
              return value;
            }
          }
          replacement += `,` //need a control if it's the last one 
      }
      else if(YNinput == "n"){
        replacement += `${JSON.stringify(packageDirectory)},` ;
      }
    }
    replacement += "]},"
    //append rest of JSON project config file  ie namespace,sfdxloginurl,sourceapiversion and packagealiases

    if(projectConfig.hasOwnProperty("namespace")){replacement += `"namespace": "${projectConfig.namespace}",`}
    if(projectConfig.hasOwnProperty("sfdcLoginUrl")){replacement += `"sfdcLoginUrl": "${projectConfig.sfdcLoginUrl}",`}
    if(projectConfig.hasOwnProperty("sourceApiVersion")){replacement += `"sourceApiVersion": "${projectConfig.sourceApiVersion}",`}
    if(projectConfig.hasOwnProperty("packageAliases")){replacement += `"packageAliases": ${JSON.stringify(projectConfig.packageAliases)} }` }

    fs.writeFileSync("sfdx-project.json",replacement)
  
    return;
  }

  private async yesNoInput(prompt) {
    let input = await cli.prompt(`${prompt}?`);
    if (input == "y" || input == "n" || input == "q") {
      return input;
    } else {
      return this.yesNoInput(prompt);
    }
  }

  private readJSON() {
    let projectConfig = JSON.parse(
      fs.readFileSync("sfdx-project.json", "utf8")
    );
    return projectConfig;
  }

  private appendNamespace(){
    
  }
  private async listPackages() {
    let projectConfig = this.readJSON();
    for (let packageDirectory of projectConfig.packageDirectories) {
      this.ux.log(packageDirectory.package);
    }
  }

  /**
   * Check the inputted version matches a regular expression pattern of 1.1.1.1 
   * @param input the string to search the regex for
   * @returns true if the input adheres to the regex format
   */
  private checkVersionInput(input: string) {
    let versionRegExp = "^[0-9]+.[0-9]+.[0-9]+.[0-9]+$"; //TODO: Add .NEXT to checker
    if (input.search(versionRegExp) != null) {
      return true;
    } else {
      return this.checkVersionInput(input);
    }
  }
}
