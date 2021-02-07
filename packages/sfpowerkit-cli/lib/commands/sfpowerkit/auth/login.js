"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const ts_types_1 = require("@salesforce/ts-types");
const command_1 = require("@salesforce/command");
const rimraf = __importStar(require("rimraf"));
const jsforce_1 = require("jsforce");
const core_1 = require("@salesforce/core");
// tslint:disable-next-line:ordered-imports
var jsforce = require("jsforce");
// Initialize Messages with the current plugin directory
command_1.core.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = command_1.core.Messages.loadMessages(
  "sfpowerkit",
  "auth_login"
);
class Login extends command_1.SfdxCommand {
  run() {
    return __awaiter(this, void 0, void 0, function* () {
      rimraf.sync("temp_sfpowerkit");
      if (this.flags.url) this.loginUrl = this.flags.url;
      else this.loginUrl = "https://test.salesforce.com";
      if (this.flags.securitytoken)
        this.password = this.flags.password.concat(this.flags.securitytoken);
      else this.password = this.flags.password;
      let conn = new jsforce_1.Connection({
        loginUrl: this.loginUrl,
      });
      yield conn.login(
        this.flags.username,
        this.password,
        function (err, userInfo) {
          if (err) {
            throw new core_1.SfdxError("Unable to connect to the target org");
          }
        }
      );
      const accessTokenOptions = {
        accessToken: conn.accessToken,
        instanceUrl: conn.instanceUrl,
        loginUrl: this.loginUrl,
        orgId: ts_types_1.getString(conn, "userInfo.organizationId"),
      };
      const auth = yield core_1.AuthInfo.create({
        username: this.flags.username,
        accessTokenOptions,
      });
      yield auth.save();
      if (this.flags.alias) {
        const aliases = yield core_1.Aliases.create(
          core_1.ConfigGroup.getOptions("orgs", "alias.json")
        );
        aliases.set(this.flags.alias, this.flags.username);
        yield aliases.write();
      }
      this.ux.log(`Authorized to ${this.flags.username}`);
      return { username: this.flags.username, accessTokenOptions };
    });
  }
}
exports.default = Login;
Login.description = messages.getMessage("commandDescription");
Login.examples = [
  `$ sfdx sfpowerkit:auth:login -u azlam@sfdc.com -p Xasdax2w2  -a prod
      Authorized to azlam@sfdc.com
  `,
];
Login.flagsConfig = {
  username: command_1.flags.string({
    required: true,
    char: "u",
    description: messages.getMessage("usernameFlagDescription"),
  }),
  password: command_1.flags.string({
    required: true,
    char: "p",
    description: messages.getMessage("passwordFlagDescription"),
  }),
  securitytoken: command_1.flags.string({
    required: false,
    char: "s",
    description: messages.getMessage("securityTokenFlagDescription"),
  }),
  url: command_1.flags.url({
    required: false,
    char: "r",
    description: messages.getMessage("urlFlagDescription"),
  }),
  alias: command_1.flags.string({
    required: false,
    char: "a",
    description: messages.getMessage("aliasFlagDescription"),
  }),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tbWFuZHMvc2Zwb3dlcmtpdC9hdXRoL2xvZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUEwRDtBQUMxRCxpREFBK0Q7QUFDL0QsK0NBQWlDO0FBQ2pDLHFDQUFxQztBQUVyQywyQ0FBNkU7QUFDN0UsMkNBQTJDO0FBQzNDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqQyx3REFBd0Q7QUFDeEQsY0FBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxpR0FBaUc7QUFDakcsbUZBQW1GO0FBQ25GLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUV4RSxNQUFxQixLQUFNLFNBQVEscUJBQVc7SUF3Qy9CLEdBQUc7O1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRS9CLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHO2dCQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O2dCQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLDZCQUE2QixDQUFDO1lBRW5ELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO2dCQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztnQkFDbEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUV6QyxJQUFJLElBQUksR0FBRyxJQUFJLG9CQUFVLENB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
