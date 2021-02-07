"use strict";
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@salesforce/core");
let request = require("request-promise-native");
const sfpowerkit_1 = require("../sfpowerkit");
let retry = require("async-retry");
const util_1 = require("util");
const passwordgenerateimpl_1 = __importDefault(
  require("../impl/user/passwordgenerateimpl")
);
const ORDER_BY_FILTER = " ORDER BY CreatedDate ASC";
class ScratchOrgUtils {
  static checkForNewVersionCompatible(hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let conn = hubOrg.getConnection();
      let expectedValues = ["In Progress", "Available", "Allocate", "Assigned"];
      let availableValues = [];
      if (!this.isVersionCompatibilityChecked) {
        yield retry(
          (bail) =>
            __awaiter(this, void 0, void 0, function* () {
              const describeResult = yield conn
                .sobject("ScratchOrgInfo")
                .describe();
              if (describeResult) {
                for (const field of describeResult.fields) {
                  if (
                    field.name === "Allocation_status__c" &&
                    field.picklistValues.length === 4
                  ) {
                    for (let picklistValue of field.picklistValues) {
                      if (picklistValue.active) {
                        availableValues.push(picklistValue.value);
                      }
                    }
                    break;
                  }
                }
              }
            }),
          { retries: 3, minTimeout: 30000 }
        );
        this.isVersionCompatibilityChecked = true;
        //If there are values returned, its not compatible
        this.isNewVersionCompatible =
          expectedValues.filter((item) => {
            return !availableValues.includes(item);
          }).length == 0
            ? true
            : false;
        if (!this.isNewVersionCompatible) {
          sfpowerkit_1.SFPowerkit.log(
            `Required Prerequisite values in ScratchOrgInfo.Allocation_status__c field is missing in the DevHub, expected values are : ${expectedValues}\n` +
              `Switching back to previous version, we request you to update ScratchOrgInfo.Allocation_status__c field in the DevHub \n` +
              `For more information Please refer https://github.com/Accenture/sfpowerkit/blob/main/src_saleforce_packages/scratchorgpool/force-app/main/default/objects/ScratchOrgInfo/fields/Allocation_status__c.field-meta.xml \n`,
            core_1.LoggerLevel.WARN
          );
        }
      }
      return this.isNewVersionCompatible;
    });
  }
  static getScratchOrgLimits(hubOrg, apiversion) {
    return __awaiter(this, void 0, void 0, function* () {
      let conn = hubOrg.getConnection();
      var query_uri = `${conn.instanceUrl}/services/data/v${apiversion}/limits`;
      const limits = yield request({
        method: "get",
        url: query_uri,
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
        },
        json: true,
      });
      sfpowerkit_1.SFPowerkit.log(
        `Limits Fetched: ${JSON.stringify(limits)}`,
        core_1.LoggerLevel.TRACE
      );
      return limits;
    });
  }
  static getScratchOrgRecordsAsMapByUser(hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let conn = hubOrg.getConnection();
      let query =
        "SELECT count(id) In_Use, SignupEmail FROM ActiveScratchOrg GROUP BY SignupEmail ORDER BY count(id) DESC";
      const results = yield conn.query(query);
      sfpowerkit_1.SFPowerkit.log(
        `Info Fetched: ${JSON.stringify(results)}`,
        core_1.LoggerLevel.DEBUG
      );
      let scratchOrgRecordAsMapByUser = ScratchOrgUtils.arrayToObject(
        results.records,
        "SignupEmail"
      );
      return scratchOrgRecordAsMapByUser;
    });
  }
  static getScratchOrgLoginURL(hubOrg, username) {
    return __awaiter(this, void 0, void 0, function* () {
      let conn = hubOrg.getConnection();
      let query = `SELECT Id, SignupUsername, LoginUrl FROM ScratchOrgInfo WHERE SignupUsername = '${username}'`;
      sfpowerkit_1.SFPowerkit.log("QUERY:" + query, core_1.LoggerLevel.DEBUG);
      const results = yield conn.query(query);
      sfpowerkit_1.SFPowerkit.log(
        `Login URL Fetched: ${JSON.stringify(results)}`,
        core_1.LoggerLevel.DEBUG
      );
      return results.records[0].LoginUrl;
    });
  }
  static createScratchOrg(
    sfdx,
    id,
    adminEmail,
    config_file_path,
    expiry,
    hubOrg
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      sfpowerkit_1.SFPowerkit.log(
        "Parameters: " +
          id +
          " " +
          adminEmail +
          " " +
          config_file_path +
          " " +
          expiry +
          " ",
        core_1.LoggerLevel.TRACE
      );
      let result;
      try {
        if (adminEmail) {
          result = yield sfdx.force.org.create(
            {
              quiet: false,
              definitionfile: config_file_path,
              setalias: `SO${id}`,
              durationdays: expiry,
              targetdevhubusername: hubOrg.getUsername(),
              wait: 10,
            },
            `adminEmail=${adminEmail}`
          );
        } else {
          result = yield sfdx.force.org.create({
            quiet: false,
            definitionfile: config_file_path,
            setalias: `SO${id}`,
            durationdays: expiry,
            targetdevhubusername: hubOrg.getUsername(),
            wait: 10,
          });
        }
      } catch (error) {
        throw new error("Unable to create scratch org");
      }
      sfpowerkit_1.SFPowerkit.log(
        JSON.stringify(result),
        core_1.LoggerLevel.TRACE
      );
      let scratchOrg = {
        alias: `SO${id}`,
        orgId: result.orgId,
        username: result.username,
        signupEmail: adminEmail ? adminEmail : "",
      };
      //Get FrontDoor URL
      scratchOrg.loginURL = yield this.getScratchOrgLoginURL(
        hubOrg,
        scratchOrg.username
      );
      //Generate Password
      const soConn = yield core_1.Connection.create({
        authInfo: yield core_1.AuthInfo.create({
          username: scratchOrg.username,
        }),
      });
      let passwordData = yield passwordgenerateimpl_1.default.run(soConn);
      scratchOrg.password = passwordData.password;
      if (!passwordData.password) {
        throw new Error("Unable to setup password to scratch org");
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `Password successfully set for ${passwordData.username} : ${passwordData.password}`,
          core_1.LoggerLevel.INFO
        );
      }
      sfpowerkit_1.SFPowerkit.log(
        JSON.stringify(scratchOrg),
        core_1.LoggerLevel.TRACE
      );
      return scratchOrg;
    });
  }
  static shareScratchOrgThroughEmail(emailId, scratchOrg, hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubOrgUserName = hubOrg.getUsername();
      let body = `${hubOrgUserName} has fetched a new scratch org from the Scratch Org Pool!\n
   All the post scratch org scripts have been succesfully completed in this org!\n
   The Login url for this org is : ${scratchOrg.loginURL}\n
   Username: ${scratchOrg.username}\n
   Password: ${scratchOrg.password}\n
   Please use sfdx force:auth:web:login -r ${scratchOrg.loginURL} -a <alias>  command to authenticate against this Scratch org</p>
   Thank you for using sfpowerkit!`;
      const options = {
        method: "post",
        body: JSON.stringify({
          inputs: [
            {
              emailBody: body,
              emailAddresses: emailId,
              emailSubject: `${hubOrgUserName} created you a new Salesforce org`,
              senderType: "CurrentUser",
            },
          ],
        }),
        url: "/services/data/v50.0/actions/standard/emailSimple",
      };
      yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            yield hubOrg.getConnection().request(options);
          }),
        { retries: 3, minTimeout: 30000 }
      );
      sfpowerkit_1.SFPowerkit.log(
        `Succesfully send email to ${emailId} for ${scratchOrg.username}`,
        core_1.LoggerLevel.INFO
      );
    });
  }
  static getScratchOrgRecordId(scratchOrgs, hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      if (scratchOrgs == undefined || scratchOrgs.length == 0) return;
      let hubConn = hubOrg.getConnection();
      let scratchOrgIds = scratchOrgs
        .map(function (scratchOrg) {
          scratchOrg.orgId = scratchOrg.orgId.slice(0, 15);
          return `'${scratchOrg.orgId}'`;
        })
        .join(",");
      let query = `SELECT Id, ScratchOrg FROM ScratchOrgInfo WHERE ScratchOrg IN ( ${scratchOrgIds} )`;
      sfpowerkit_1.SFPowerkit.log("QUERY:" + query, core_1.LoggerLevel.TRACE);
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            const results = yield hubConn.query(query);
            let resultAsObject = this.arrayToObject(
              results.records,
              "ScratchOrg"
            );
            sfpowerkit_1.SFPowerkit.log(
              JSON.stringify(resultAsObject),
              core_1.LoggerLevel.TRACE
            );
            scratchOrgs.forEach((scratchOrg) => {
              scratchOrg.recordId = resultAsObject[scratchOrg.orgId]["Id"];
            });
            return results;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static setScratchOrgInfo(soInfo, hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      sfpowerkit_1.SFPowerkit.log(
        JSON.stringify(soInfo),
        core_1.LoggerLevel.TRACE
      );
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            try {
              let result = yield hubConn
                .sobject("ScratchOrgInfo")
                .update(soInfo);
              sfpowerkit_1.SFPowerkit.log(
                "Setting Scratch Org Info:" + JSON.stringify(result),
                core_1.LoggerLevel.TRACE
              );
              return result.constructor !== Array ? result.success : true;
            } catch (err) {
              sfpowerkit_1.SFPowerkit.log(
                "Failure at setting ScratchOrg Info" + err,
                core_1.LoggerLevel.TRACE
              );
              return false;
            }
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static getScratchOrgsByTag(tag, hubOrg, isMyPool, unAssigned) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let query;
            if (!util_1.isNullOrUndefined(tag))
              query = `SELECT Pooltag__c, Id,  CreatedDate, ScratchOrg, ExpirationDate, SignupUsername, SignupEmail, Password__c, Allocation_status__c,LoginUrl FROM ScratchOrgInfo WHERE Pooltag__c = '${tag}'  AND Status = 'Active' `;
            else
              query = `SELECT Pooltag__c, Id,  CreatedDate, ScratchOrg, ExpirationDate, SignupUsername, SignupEmail, Password__c, Allocation_status__c,LoginUrl FROM ScratchOrgInfo WHERE Pooltag__c != null  AND Status = 'Active' `;
            if (isMyPool) {
              query =
                query + ` AND createdby.username = '${hubOrg.getUsername()}' `;
            }
            if (unAssigned && this.isNewVersionCompatible) {
              // if new version compatible get Available / In progress
              query =
                query +
                `AND ( Allocation_status__c ='Available' OR Allocation_status__c = 'In Progress' ) `;
            } else if (unAssigned && !this.isNewVersionCompatible) {
              // if new version not compatible get not Assigned
              query = query + `AND Allocation_status__c !='Assigned' `;
            }
            query = query + ORDER_BY_FILTER;
            sfpowerkit_1.SFPowerkit.log(
              "QUERY:" + query,
              core_1.LoggerLevel.TRACE
            );
            const results = yield hubConn.query(query);
            return results;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static getActiveScratchOrgsByInfoId(hubOrg, scrathOrgIds) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT Id, SignupUsername FROM ActiveScratchOrg WHERE ScratchOrgInfoId IN (${scrathOrgIds}) `;
            sfpowerkit_1.SFPowerkit.log(
              "QUERY:" + query,
              core_1.LoggerLevel.TRACE
            );
            const results = yield hubConn.query(query);
            return results;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static getCountOfActiveScratchOrgsByTag(tag, hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT Id, CreatedDate, ScratchOrg, ExpirationDate, SignupUsername, SignupEmail, Password__c, Allocation_status__c,LoginUrl FROM ScratchOrgInfo WHERE Pooltag__c = '${tag}' AND Status = 'Active' `;
            sfpowerkit_1.SFPowerkit.log(
              "QUERY:" + query,
              core_1.LoggerLevel.TRACE
            );
            const results = yield hubConn.query(query);
            sfpowerkit_1.SFPowerkit.log(
              "RESULT:" + JSON.stringify(results),
              core_1.LoggerLevel.TRACE
            );
            return results.totalSize;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static getCountOfActiveScratchOrgsByTagAndUsername(tag, hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT Id, CreatedDate, ScratchOrg, ExpirationDate, SignupUsername, SignupEmail, Password__c, Allocation_status__c,LoginUrl FROM ScratchOrgInfo WHERE Pooltag__c = '${tag}' AND Status = 'Active' `;
            sfpowerkit_1.SFPowerkit.log(
              "QUERY:" + query,
              core_1.LoggerLevel.TRACE
            );
            const results = yield hubConn.query(query);
            return results.totalSize;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static getActiveScratchOrgRecordIdGivenScratchOrg(
    hubOrg,
    apiversion,
    scratchOrgId
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            var query_uri = `${hubConn.instanceUrl}/services/data/v${apiversion}/query?q=SELECT+Id+FROM+ActiveScratchOrg+WHERE+ScratchOrg+=+'${scratchOrgId}'`;
            const result = yield request({
              method: "get",
              url: query_uri,
              headers: {
                Authorization: `Bearer ${hubConn.accessToken}`,
              },
              json: true,
            });
            sfpowerkit_1.SFPowerkit.log(
              "Retrieve Active ScratchOrg Id:" + JSON.stringify(result),
              core_1.LoggerLevel.TRACE
            );
            return result.records[0].Id;
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static deleteScratchOrg(hubOrg, scratchOrgIds) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            yield hubConn.sobject("ActiveScratchOrg").del(scratchOrgIds);
          }),
        { retries: 3, minTimeout: 3000 }
      );
    });
  }
  static checkForPreRequisite(hubOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      let hubConn = hubOrg.getConnection();
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            const results = yield hubConn.metadata.read(
              "CustomObject",
              "ScratchOrgInfo"
            );
            const checker = (element) =>
              element.fullName === "Allocation_status__c";
            sfpowerkit_1.SFPowerkit.log(
              JSON.stringify(results),
              core_1.LoggerLevel.TRACE
            );
            if (results["fields"].some(checker)) {
              return true;
            } else {
              return false;
            }
          }),
        { retries: 3, minTimeout: 2000 }
      );
    });
  }
}
exports.default = ScratchOrgUtils;
ScratchOrgUtils.isNewVersionCompatible = false;
ScratchOrgUtils.isVersionCompatibilityChecked = false;
ScratchOrgUtils.arrayToObject = (array, keyfield) =>
  array.reduce((obj, item) => {
    obj[item[keyfield]] = item;
    return obj;
  }, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaE9yZ1V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3NjcmF0Y2hPcmdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUEwRTtBQUMxRSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNoRCw4Q0FBMkM7QUFFM0MsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25DLCtCQUF5QztBQUN6Qyw2RkFBcUU7QUFFckUsTUFBTSxlQUFlLEdBQUcsMkJBQTJCLENBQUM7QUFDcEQsTUFBcUIsZUFBZTtJQUkzQixNQUFNLENBQU8sNEJBQTRCLENBQUMsTUFBVzs7WUFDMUQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2xDLElBQUksY0FBYyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDMUUsSUFBSSxlQUFlLEdBQWEsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ3ZDLE1BQU0sS0FBSyxDQUNULENBQU8sSUFBSSxFQUFFLEVBQUU7b0JBQ2IsTUFBTSxjQUFjLEdBQVEsTUFBTSxJQUFJO3lCQUNuQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7eUJBQ3pCLFFBQVEsRUFBRSxDQUFDO29CQUNkLElBQUksY0FBYyxFQUFFO3dCQUNsQixLQUFLLE1BQU0sS0FBSyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7NEJBQ3pDLElBQ0UsS0FBSyxDQUFDLElBQUksS0FBSyxzQkFBc0I7Z0NBQ3JDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDakM7Z0NBQ0EsS0FBSyxJQUFJLGFBQWEsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFO29DQUM5QyxJQUFJLGFBQWEs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
