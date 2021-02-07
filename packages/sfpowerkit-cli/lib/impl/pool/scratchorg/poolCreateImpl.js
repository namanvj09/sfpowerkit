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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const scratchOrgUtils_1 = __importDefault(
  require("../../../utils/scratchOrgUtils")
);
const core_1 = require("@salesforce/core");
const sfpowerkit_1 = require("../../../sfpowerkit");
const fs = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
const bottleneck_1 = __importDefault(require("bottleneck"));
const util_1 = require("util");
const relaxIPRangeImpl_1 = __importDefault(
  require("../../org/relaxIPRangeImpl")
);
const fileutils_1 = __importDefault(require("../../../utils/fileutils"));
const path = __importStar(require("path"));
const rimraf = __importStar(require("rimraf"));
class PoolCreateImpl {
  constructor(poolconfigFilePath, hubOrg, apiversion, sfdx, batchSize) {
    this.poolconfigFilePath = poolconfigFilePath;
    this.hubOrg = hubOrg;
    this.apiversion = apiversion;
    this.sfdx = sfdx;
    this.batchSize = batchSize;
    this.totalAllocated = 0;
    this.arrayToObject = (array, keyfield) =>
      array.reduce((obj, item) => {
        obj[item[keyfield]] = item;
        return obj;
      }, {});
    this.limiter = new bottleneck_1.default({
      maxConcurrent: batchSize,
    });
    this.scriptExecutorWrappedForBottleneck = this.limiter.wrap(
      this.scriptExecutor
    );
    this.ipRangeRelaxerWrappedForBottleneck = this.limiter.wrap(
      this.ipRangeRelaxer
    );
  }
  poolScratchOrgs() {
    return __awaiter(this, void 0, void 0, function* () {
      yield scratchOrgUtils_1.default.checkForNewVersionCompatible(this.hubOrg);
      let scriptExecPromises = new Array();
      let ipRangeExecPromises = new Array();
      yield this.hubOrg.refreshAuth();
      this.hubConn = this.hubOrg.getConnection();
      let preRequisiteCheck = yield scratchOrgUtils_1.default.checkForPreRequisite(
        this.hubOrg
      );
      if (!preRequisiteCheck) {
        sfpowerkit_1.SFPowerkit.log(
          "Required Prerequisite fields are missing in the DevHub, Please look into the wiki to getting the fields deployed in DevHub",
          core_1.LoggerLevel.ERROR
        );
        return false;
      }
      //Read pool config file
      if (!fs.existsSync(this.poolconfigFilePath)) {
        sfpowerkit_1.SFPowerkit.log(
          "Poll Config Path not provided, Unable to create pool without this file",
          core_1.LoggerLevel.ERROR
        );
        return false;
      }
      this.poolConfig = JSON.parse(
        fs.readFileSync(this.poolconfigFilePath).toString()
      );
      //Validate Inputs
      if (util_1.isNullOrUndefined(this.poolConfig.pool.config_file_path)) {
        sfpowerkit_1.SFPowerkit.log(
          "Scratch Org Config Path not provided, Unable to create pool without this file",
          core_1.LoggerLevel.ERROR
        );
        return true;
      }
      if (
        util_1.isNullOrUndefined(this.poolConfig.pool.expiry) ||
        util_1.isNullOrUndefined(this.poolConfig.pool.tag)
      ) {
        sfpowerkit_1.SFPowerkit.log(
          "Some Key parameters are missing in the schema,Please consult the documentation",
          core_1.LoggerLevel.ERROR
        );
        return true;
      }
      this.validateScriptFile();
      if (this.poolConfig.poolUsers && this.poolConfig.poolUsers.length > 0)
        this.poolConfig.pool.user_mode = true;
      else this.poolConfig.pool.user_mode = false;
      //Set Tag Only mode activated for the default use case
      if (this.poolConfig.pool.user_mode == false)
        this.setASingleUserForTagOnlyMode();
      sfpowerkit_1.SFPowerkit.log(
        "Pool Config:" + JSON.stringify(this.poolConfig),
        core_1.LoggerLevel.TRACE
      );
      if (
        !this.poolConfig.pool.relax_all_ip_ranges &&
        util_1.isNullOrUndefined(this.poolConfig.pool.relax_ip_ranges) &&
        !this.poolConfig.pool.user_mode
      ) {
        sfpowerkit_1.SFPowerkit.log(
          "IP Ranges are not relaxed, The created scratch org's will have the pool creators email as Admin Email and has to be verifed before use",
          core_1.LoggerLevel.WARN
        );
      }
      //fetch current status limits
      yield this.fetchCurrentLimits();
      //Compute allocation
      this.totalToBeAllocated = yield this.computeAllocation();
      if (this.totalToBeAllocated === 0) {
        if (this.limits.ActiveScratchOrgs.Remaining > 0)
          sfpowerkit_1.SFPowerkit.log(
            `The tag provided ${this.poolConfig.pool.tag} is currently at the maximum capacity , No scratch orgs will be allocated`,
            core_1.LoggerLevel.INFO
          );
        else
          sfpowerkit_1.SFPowerkit.log(
            `There is no capacity to create a pool at this time, Please try again later`,
            core_1.LoggerLevel.INFO
          );
        return;
      }
      //Generate Scratch Orgs
      yield this.generateScratchOrgs();
      // Setup Logging Directory
      rimraf.sync("script_exec_outputs");
      fileutils_1.default.mkDirByPathSync("script_exec_outputs");
      // Assign workers to executed scripts
      let ts = Math.floor(Date.now() / 1000);
      for (let poolUser of this.poolConfig.poolUsers) {
        for (let scratchOrg of poolUser.scratchOrgs) {
          sfpowerkit_1.SFPowerkit.log(
            JSON.stringify(scratchOrg),
            core_1.LoggerLevel.DEBUG
          );
          if (
            this.poolConfig.pool.relax_all_ip_ranges ||
            this.poolConfig.pool.relax_ip_ranges
          ) {
            let resultForIPRelaxation = this.ipRangeRelaxerWrappedForBottleneck(
              scratchOrg
            );
            ipRangeExecPromises.push(resultForIPRelaxation);
          }
          //Wait for scripts to finish execution
          if (
            this.poolConfig.pool.relax_all_ip_ranges ||
            this.poolConfig.pool.relax_ip_ranges
          ) {
            this.ipRangeExecResults = yield Promise.all(ipRangeExecPromises);
            this.ipRangeExecResultsAsObject = this.arrayToObject(
              this.ipRangeExecResults,
              "username"
            );
          }
          if (this.scriptFileExists) {
            let result = this.scriptExecutorWrappedForBottleneck(
              this.poolConfig.pool.script_file_path,
              scratchOrg,
              this.hubOrg.getUsername()
            );
            scriptExecPromises.push(result);
          } else {
            //Just commit it to the pool as there is no script, and ensuring it doesnt get deleted
            scratchOrg.isScriptExecuted = true;
            yield scratchOrgUtils_1.default.setScratchOrgInfo(
              {
                Id: scratchOrg.recordId,
                Pooltag__c: this.poolConfig.pool.tag,
                Allocation_status__c: scratchOrgUtils_1.default
                  .isNewVersionCompatible
                  ? "Available"
                  : "",
                Password__c: scratchOrg.password,
              },
              this.hubOrg
            );
          }
        }
      }
      let scriptExecResults = yield Promise.all(scriptExecPromises);
      if (this.scriptFileExists) {
        sfpowerkit_1.SFPowerkit.log(
          JSON.stringify(scriptExecResults),
          core_1.LoggerLevel.TRACE
        );
        ts = Math.floor(Date.now() / 1000) - ts;
        sfpowerkit_1.SFPowerkit.log(
          `Pool Execution completed in ${ts} Seconds`,
          core_1.LoggerLevel.INFO
        );
      }
      //Commit Succesfull Scratch Orgs
      let commit_result = yield this.finalizeGeneratedScratchOrgs();
      if (this.totalAllocated > 0) {
        sfpowerkit_1.SFPowerkit.log(
          `Request for provisioning ${this.totalToBeAllocated} scratchOrgs of which ${this.totalAllocated} were allocated with ${commit_result.success} success and ${commit_result.failed} failures`,
          core_1.LoggerLevel.INFO
        );
      } else {
        sfpowerkit_1.SFPowerkit.log(
          `Request for provisioning ${this.totalToBeAllocated} scratchOrgs not successfull.`,
          core_1.LoggerLevel.ERROR
        );
      }
      return true;
    });
  }
  validateScriptFile() {
    if (util_1.isNullOrUndefined(this.poolConfig.pool.script_file_path)) {
      sfpowerkit_1.SFPowerkit.log(
        "Script Path not provided, will create a pool of scratch orgs without any post creation steps",
        core_1.LoggerLevel.WARN
      );
      this.scriptFileExists = false;
    } else if (fs.existsSync(this.poolConfig.pool.script_file_path)) {
      this.scriptFileExists = true;
    } else {
      sfpowerkit_1.SFPowerkit.log(
        "Unable to locate Script File path, will crete a pool of scratch orgs without any post creation steps",
        core_1.LoggerLevel.WARN
      );
      this.scriptFileExists = false;
    }
  }
  setASingleUserForTagOnlyMode() {
    //Remove any existing pool Config for pool users
    if (this.poolConfig.poolUsers) delete this.poolConfig.poolUsers;
    let poolUser = {
      min_allocation: this.poolConfig.pool.max_allocation,
      max_allocation: this.poolConfig.pool.max_allocation,
      is_build_pooluser: false,
      expiry: this.poolConfig.pool.expiry,
      priority: 1,
    };
    //Add a single user
    this.poolConfig.poolUsers = [];
    this.poolConfig.poolUsers.push(poolUser);
    this.poolConfig.pool.user_mode = false;
  }
  fetchCurrentLimits() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        this.limits = yield scratchOrgUtils_1.default.getScratchOrgLimits(
          this.hubOrg,
          this.apiversion
        );
      } catch (error) {
        sfpowerkit_1.SFPowerkit.log(
          "Unable to connect to DevHub",
          core_1.LoggerLevel.ERROR
        );
        return;
      }
      sfpowerkit_1.SFPowerkit.log(
        `Active Scratch Orgs Remaining: ${this.limits.ActiveScratchOrgs.Remaining} out of ${this.limits.ActiveScratchOrgs.Max}`,
        core_1.LoggerLevel.TRACE
      );
    });
  }
  computeAllocation() {
    return __awaiter(this, void 0, void 0, function* () {
      //Compute current pool requirement
      if (this.poolConfig.pool.user_mode) {
        //Retrieve Number of active SOs in the org
        let scratchOrgsResult = yield scratchOrgUtils_1.default.getScratchOrgsByTag(
          this.poolConfig.pool.tag,
          this.hubOrg,
          false,
          false
        );
        scratchOrgsResult.records = scratchOrgsResult.records.sort();
        let scratchOrgsRecordAsMapByUser = scratchOrgsResult.records.reduce(
          function (obj, v) {
            obj[v.SignupEmail] = (obj[v.SignupEmail] || 0) + 1;
            return obj;
          },
          {}
        );
        sfpowerkit_1.SFPowerkit.log(
          JSON.stringify(scratchOrgsRecordAsMapByUser),
          core_1.LoggerLevel.TRACE
        );
        return this.allocateScratchOrgsPerUser(
          this.limits.ActiveScratchOrgs.Remaining,
          scratchOrgsRecordAsMapByUser,
          this.poolConfig.poolUsers
        );
      } else {
        let activeCount = yield scratchOrgUtils_1.default.getCountOfActiveScratchOrgsByTag(
          this.poolConfig.pool.tag,
          this.hubOrg
        );
        return this.allocateScratchOrgsPerTag(
          this.limits.ActiveScratchOrgs.Remaining,
          activeCount,
          this.poolConfig.pool.tag,
          this.poolConfig.poolUsers[0]
        );
      }
    });
  }
  generateScratchOrgs() {
    return __awaiter(this, void 0, void 0, function* () {
      //Generate Scratch Orgs
      for (let poolUser of this.poolConfig.poolUsers) {
        let count = 1;
        poolUser.scratchOrgs = new Array();
        for (let i = 0; i < poolUser.to_allocate; i++) {
          sfpowerkit_1.SFPowerkit.log(
            `Creating Scratch  Org  ${count} of ${this.totalToBeAllocated}..`,
            core_1.LoggerLevel.INFO
          );
          try {
            let scratchOrg = yield scratchOrgUtils_1.default.createScratchOrg(
              this.sfdx,
              count,
              poolUser.username,
              this.poolConfig.pool.config_file_path,
              poolUser.expiry ? poolUser.expiry : this.poolConfig.pool.expiry,
              this.hubOrg
            );
            poolUser.scratchOrgs.push(scratchOrg);
            this.totalAllocated++;
          } catch (error) {
            sfpowerkit_1.SFPowerkit.log(
              `Unable to provision scratch org  ${count} ..   `,
              core_1.LoggerLevel.INFO
            );
          }
          count++;
        }
        yield scratchOrgUtils_1.default.getScratchOrgRecordId(
          poolUser.scratchOrgs,
          this.hubOrg
        );
        if (scratchOrgUtils_1.default.isNewVersionCompatible) {
          let scratchOrgInprogress = [];
          poolUser.scratchOrgs.forEach((scratchOrg) => {
            scratchOrgInprogress.push({
              Id: scratchOrg.recordId,
              Pooltag__c: this.poolConfig.pool.tag,
              Allocation_status__c: "In Progress",
            });
          });
          if (scratchOrgInprogress.length > 0) {
            //set pool tag
            yield scratchOrgUtils_1.default.setScratchOrgInfo(
              scratchOrgInprogress,
              this.hubOrg
            );
          }
        }
      }
    });
  }
  finalizeGeneratedScratchOrgs() {
    return __awaiter(this, void 0, void 0, function* () {
      //Store Username Passwords
      let failed = 0;
      let success = 0;
      for (let poolUser of this.poolConfig.poolUsers) {
        for (let scratchOrg of poolUser.scratchOrgs) {
          if (scratchOrg.isScriptExecuted) {
            success++;
            continue;
          }
          sfpowerkit_1.SFPowerkit.log(
            `Failed to execute scripts for ${scratchOrg.username} with alias ${scratchOrg.alias}.. Returning to Pool`,
            core_1.LoggerLevel.ERROR
          );
          try {
            //Delete scratchorgs that failed to execute script
            let activeScratchOrgRecordId = yield scratchOrgUtils_1.default.getActiveScratchOrgRecordIdGivenScratchOrg(
              this.hubOrg,
              this.apiversion,
              scratchOrg.orgId
            );
            yield scratchOrgUtils_1.default.deleteScratchOrg(this.hubOrg, [
              activeScratchOrgRecordId,
            ]);
            sfpowerkit_1.SFPowerkit.log(
              `Succesfully deleted scratchorg  ${scratchOrg.username}`,
              core_1.LoggerLevel.TRACE
            );
          } catch (error) {
            sfpowerkit_1.SFPowerkit.log(
              `Unable to delete the scratchorg ${scratchOrg.username}..`,
              core_1.LoggerLevel.WARN
            );
          }
          failed++;
        }
      }
      return { success: success, failed: failed };
    });
  }
  allocateScratchOrgsPerTag(
    remainingScratchOrgs,
    countOfActiveScratchOrgs,
    tag,
    poolUser
  ) {
    sfpowerkit_1.SFPowerkit.log(
      "Remaining ScratchOrgs" + remainingScratchOrgs,
      core_1.LoggerLevel.TRACE
    );
    poolUser.current_allocation = countOfActiveScratchOrgs;
    poolUser.to_allocate = 0;
    poolUser.to_satisfy_max =
      poolUser.max_allocation - poolUser.current_allocation > 0
        ? poolUser.max_allocation - poolUser.current_allocation
        : 0;
    if (
      poolUser.to_satisfy_max > 0 &&
      poolUser.to_satisfy_max <= remainingScratchOrgs
    ) {
      poolUser.to_allocate = poolUser.to_satisfy_max;
    } else if (
      poolUser.to_satisfy_max > 0 &&
      poolUser.to_satisfy_max > remainingScratchOrgs
    ) {
      poolUser.to_allocate = remainingScratchOrgs;
    }
    sfpowerkit_1.SFPowerkit.log(
      "Computed Allocation" + JSON.stringify(poolUser),
      core_1.LoggerLevel.TRACE
    );
    return poolUser.to_allocate;
  }
  allocateScratchOrgsPerUser(
    remainingScratchOrgs,
    scratchOrgsRecordAsMapByUser,
    poolUsers
  ) {
    let totalToBeAllocated = 0;
    //sort pooleconfig.poolusers based on priority
    poolUsers = poolUsers.sort((a, b) => a.priority - b.priority);
    let totalMaxOrgRequired = 0,
      totalMinOrgRequired = 0;
    poolUsers.forEach((pooluser) => {
      sfpowerkit_1.SFPowerkit.log(pooluser, core_1.LoggerLevel.TRACE);
      pooluser.to_allocate = 0;
      if (scratchOrgsRecordAsMapByUser[pooluser.username]) {
        pooluser.current_allocation =
          scratchOrgsRecordAsMapByUser[pooluser.username];
        pooluser.to_satisfy_max =
          pooluser.max_allocation - pooluser.current_allocation > 0
            ? pooluser.max_allocation - pooluser.current_allocation
            : 0;
        pooluser.to_satisfy_min =
          pooluser.min_allocation - pooluser.current_allocation > 0
            ? pooluser.min_allocation - pooluser.current_allocation
            : 0;
      } else {
        pooluser.current_allocation = 0;
        pooluser.to_satisfy_max = pooluser.max_allocation;
        pooluser.to_satisfy_min = pooluser.min_allocation;
      }
      totalMaxOrgRequired += pooluser.to_satisfy_max;
      totalMinOrgRequired += pooluser.to_satisfy_min;
    });
    //All good..
    if (totalMaxOrgRequired <= remainingScratchOrgs) {
      // Satisfy max. allocate max
      poolUsers.forEach((pooluser) => {
        pooluser.to_allocate = pooluser.to_satisfy_max;
        totalToBeAllocated += pooluser.to_satisfy_max;
      });
    } else if (totalMinOrgRequired <= remainingScratchOrgs) {
      // Satisfy min
      //First allocate minimum to everyone
      poolUsers.forEach((pooluser) => {
        pooluser.to_allocate = pooluser.to_satisfy_min;
        totalToBeAllocated += pooluser.to_satisfy_min;
      });
      //Check for left overs
      let leftOver = remainingScratchOrgs - totalMinOrgRequired;
      if (leftOver > 0) {
        //Allocate LeftOver in a round robin model
        while (leftOver > 0) {
          poolUsers.forEach((pooluser) => {
            if (leftOver == 0) return;
            if (
              pooluser.current_allocation + pooluser.to_allocate <
              pooluser.to_satisfy_max
            ) {
              pooluser.to_allocate++;
              totalToBeAllocated++;
              leftOver--;
            }
          });
        }
      }
    } else {
      let leftOver = remainingScratchOrgs;
      //Allocate LeftOver in a round robin model
      while (leftOver >= 0) {
        poolUsers.forEach((pooluser) => {
          if (
            pooluser.current_allocation + pooluser.to_allocate <
            pooluser.to_satisfy_max
          ) {
            pooluser.to_allocate++;
            totalToBeAllocated++;
            leftOver--;
          }
        });
      }
    }
    return totalToBeAllocated;
  }
  ipRangeRelaxer(scratchOrg) {
    return __awaiter(this, void 0, void 0, function* () {
      //executue using bash
      sfpowerkit_1.SFPowerkit.log(
        `Relaxing ip ranges for scratchOrg with user ${scratchOrg.username}`,
        core_1.LoggerLevel.INFO
      );
      const connection = yield core_1.Connection.create({
        authInfo: yield core_1.AuthInfo.create({
          username: scratchOrg.username,
        }),
      });
      if (this.poolConfig.pool.relax_all_ip_ranges) {
        this.poolConfig.pool.relax_ip_ranges = [];
        return relaxIPRangeImpl_1.default.setIp(
          connection,
          scratchOrg.username,
          this.poolConfig.pool.relax_ip_ranges,
          this.poolConfig.pool.relax_all_ip_ranges
        );
      } else {
        return relaxIPRangeImpl_1.default.setIp(
          connection,
          scratchOrg.username,
          this.poolConfig.pool.relax_ip_ranges
        );
      }
    });
  }
  scriptExecutor(scriptFilePath, scratchOrg, hubOrgUserName) {
    return __awaiter(this, void 0, void 0, function* () {
      //executue using bash
      let cmd;
      sfpowerkit_1.SFPowerkit.log(
        `Script File Path: ${scriptFilePath}`,
        core_1.LoggerLevel.TRACE
      );
      scriptFilePath = path.normalize(scriptFilePath);
      if (process.platform != "win32") {
        cmd = `bash ${scriptFilePath}  ${scratchOrg.username}  ${hubOrgUserName} `;
      } else {
        cmd = `cmd.exe /c ${scriptFilePath}  ${scratchOrg.username}  ${hubOrgUserName}`;
      }
      sfpowerkit_1.SFPowerkit.log(
        `Executing command: ${cmd}`,
        core_1.LoggerLevel.INFO
      );
      sfpowerkit_1.SFPowerkit.log(
        `Executing script for ${scratchOrg.alias} with username: ${scratchOrg.username}`,
        core_1.LoggerLevel.INFO
      );
      sfpowerkit_1.SFPowerkit.log(
        `Script Execution result is being written to script_exec_outputs/${scratchOrg.alias}.log, Please note this will take a significant time depending on the  script being executed`,
        core_1.LoggerLevel.INFO
      );
      let fdr = fs.openSync(`script_exec_outputs/${scratchOrg.alias}.log`, "a");
      return new Promise((resolve, reject) => {
        let ls = child_process_1.exec(
          cmd,
          { cwd: process.cwd() },
          (error, stdout, stderr) => {
            if (error) {
              sfpowerkit_1.SFPowerkit.log(
                `Failed to execute script for ${scratchOrg.username}`,
                core_1.LoggerLevel.WARN
              );
              scratchOrg.isScriptExecuted = false;
              resolve({
                isSuccess: false,
                message: error.message,
                scratchOrgUsername: scratchOrg.username,
                status: "failure",
              });
              return;
            }
            scratchOrg.isScriptExecuted = true;
            if (
              (this.poolConfig.pool.relax_all_ip_ranges ||
                this.poolConfig.pool.relax_ip_ranges) &&
              !this.ipRangeExecResultsAsObject[scratchOrg.username]["success"]
            )
              scratchOrg.isScriptExecuted = false;
            if (scratchOrg.isScriptExecuted) {
              sfpowerkit_1.SFPowerkit.log(
                `Script Execution completed for ${scratchOrg.username} with alias ${scratchOrg.alias}`,
                core_1.LoggerLevel.INFO
              );
              scratchOrgUtils_1.default
                .setScratchOrgInfo(
                  {
                    Id: scratchOrg.recordId,
                    Pooltag__c: this.poolConfig.pool.tag,
                    Allocation_status__c: scratchOrgUtils_1.default
                      .isNewVersionCompatible
                      ? "Available"
                      : "",
                    Password__c: scratchOrg.password,
                  },
                  this.hubOrg
                )
                .then(
                  (result) => {
                    scratchOrg.isScriptExecuted = true;
                    fs.closeSync(fdr);
                    resolve({
                      isSuccess: true,
                      message: "Successfuly set the scratch org record in Pool",
                      scratchOrgUsername: scratchOrg.username,
                      status: "success",
                    });
                  },
                  (reason) => {
                    fs.closeSync(fdr);
                    scratchOrg.isScriptExecuted = false;
                    resolve({
                      isSuccess: false,
                      message: "Unable to set the scratch org record in Pool",
                      scratchOrgUsername: scratchOrg.username,
                      status: "failure",
                    });
                  }
                );
            }
          }
        );
        ls.stderr.on("data", function (data) {
          fs.appendFileSync(
            `script_exec_outputs/${scratchOrg.alias}.log`,
            data
          );
        });
        ls.stdout.on("data", function (data) {
          fs.appendFileSync(
            `script_exec_outputs/${scratchOrg.alias}.log`,
            data
          );
        });
      });
    });
  }
}
exports.default = PoolCreateImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbENyZWF0ZUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9wb29sL3NjcmF0Y2hvcmcvcG9vbENyZWF0ZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUZBQTZFO0FBQzdFLDJDQUEwRTtBQUMxRSxvREFBaUQ7QUFDakQsNkNBQStCO0FBQy9CLGlEQUFxQztBQUNyQyw0REFBb0M7QUFDcEMsK0JBQXlDO0FBQ3pDLGtGQUEwRDtBQUMxRCx5RUFBaUQ7QUFDakQsMkNBQTZCO0FBQzdCLCtDQUFpQztBQUdqQyxNQUFxQixjQUFjO0lBY2pDLFlBQ1Usa0JBQTBCLEVBQzFCLE1BQVcsRUFDWCxVQUFrQixFQUNsQixJQUFhLEVBQ2IsU0FBaUI7UUFKakIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO1FBQzFCLFdBQU0sR0FBTixNQUFNLENBQUs7UUFDWCxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFNBQUksR0FBSixJQUFJLENBQVM7UUFDYixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBVm5CLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBaXJCM0Isa0JBQWEsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUMxQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0IsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUF6cUJQLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxvQkFBVSxDQUFDO1lBQzVCLGFBQWEsRUFBRSxTQUFTO1NBQ3pCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQ0FBa0MsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDekQsSUFBSSxDQUFDLGNBQWMsQ0FDcEIsQ0FBQztRQUNGLElBQUksQ0FBQyxrQ0FBa0MsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDekQsSUFBSSxDQUFDLGNBQWMsQ0FDcEIsQ0FBQztJQUNKLENBQUM7SUFFWSxlQUFlOztZQUMxQixNQUFNLHlCQUFlLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLElBQUksa0JBQWtCLEdBQTBDLElBQUksS0FBSyxFQUFFLENBQUM7WUFDNUUsSUFBSSxtQkFBbUIsR0FHakIsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUVsQixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRTNDLElBQUksaUJBQWlCLEdBQUcsTUFBTSx5QkFBZSxDQUFDLG9CQUFvQixDQUNoRSxJQUFJLENBQUMsTUFBTSxDQUNaLENBQUM7WUFFRixJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3RCLHVCQUFVLENBQUMsR0FBRyxDQUNaLDRIQUE0SCxFQUM1SCxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztnQkFDRixPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsdUJBQXVCO1lBRXZCLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUMzQyx1QkFBVSxDQUFDLEdBQUcsQ0FDWix3RUFBd0UsRUFDeEUsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7Z0JBQ0YsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDMUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDcEQsQ0FBQztZQUVGLGlCQUFpQjtZQUNqQixJQUFJLHdCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzVELHVCQUFVLENBQUMsR0FBRyxDQUNaLCtFQUErRSxFQUMvRSxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztnQkFDRixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFDRSx3QkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQzlDLHdCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUMzQztnQkFDQSx1QkFBVSxDQUFDLEdBQUcsQ0FDWixnRkFBZ0YsRUFDaEYsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7Z0JBQ0YsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBRTFCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O2dCQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRTVDLHNEQUFzRDtZQUN0RCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxLQUFLO2dCQUN6QyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUV0Qyx1QkFBVSxDQUFDLEdBQUcsQ0FDWixjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQ2hELGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO1lBRUYsSUFDRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQjtnQkFDekMsd0JBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO2dCQUN2RCxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDL0I7Z0JBQ0EsdUJBQVUsQ0FBQyxHQUFHLENBQ1osd0lBQXdJLEVBQ3hJLGtCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2FBQ0g7WUFFRCw2QkFBNkI7WUFDN0IsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUVoQyxvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFekQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLENBQUM7b0JBQzdDLHVCQUFVLENBQUMsR0FBRyxDQUNaLG9CQUFvQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLDJFQUEyRSxFQUN2SCxrQkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQzs7b0JBRUYsdUJBQVUsQ0FBQyxHQUFHLENBQ1osNEVBQTRFLEVBQzVFLGtCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO2dCQUNKLE9BQU87YUFDUjtZQUVELHVCQUF1QjtZQUN2QixNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRWpDLDBCQUEwQjtZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbkMsbUJBQVMsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUVqRCxxQ0FBcUM7WUFDckMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDdkMsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDOUMsS0FBSyxJQUFJLFVBQVUsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO29CQUMzQyx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLGtCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRTlELElBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO3dCQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQ3BDO3dCQUNBLElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUNqRSxVQUFVLENBQ1gsQ0FBQzt3QkFDRixtQkFBbUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztxQkFDakQ7b0JBRUQsc0NBQXNDO29CQUN0QyxJQUNFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQjt3QkFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUNwQzt3QkFDQSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7d0JBQ2pFLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUNsRCxJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLFVBQVUsQ0FDWCxDQUFDO3FCQUNIO29CQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO3dCQUN6QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQ2xELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUNyQyxVQUFVLEVBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FDMUIsQ0FBQzt3QkFDRixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ2pDO3lCQUFNO3dCQUNMLHNGQUFzRjt3QkFDdEYsVUFBVSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzt3QkFDbkMsTUFBTSx5QkFBZSxDQUFDLGlCQUFpQixDQUNyQzs0QkFDRSxFQUFFLEVBQUUsVUFBVSxDQUFDLFFBQVE7NEJBQ3ZCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHOzRCQUNwQyxvQkFBb0IsRUFBRSx5QkFBZSxDQUFDLHNCQUFzQjtnQ0FDMUQsQ0FBQyxDQUFDLFdBQVc7Z0NBQ2IsQ0FBQyxDQUFDLEVBQUU7NEJBQ04sV0FBVyxFQUFFLFVBQVUsQ0FBQyxRQUFRO3lCQUNqQyxFQUNELElBQUksQ0FBQyxNQUFNLENBQ1osQ0FBQztxQkFDSDtpQkFDRjthQUNGO1lBRUQsSUFBSSxpQkFBaUIsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUU5RCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekIsdUJBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLGtCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JFLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3hDLHVCQUFVLENBQUMsR0FBRyxDQUNaLCtCQUErQixFQUFFLFVBQVUsRUFDM0Msa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7YUFDSDtZQUVELGdDQUFnQztZQUNoQyxJQUFJLGFBQWEsR0FHYixNQUFNLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBRTlDLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLHVCQUFVLENBQUMsR0FBRyxDQUNaLDRCQUE0QixJQUFJLENBQUMsa0JBQWtCLHlCQUF5QixJQUFJLENBQUMsY0FBYyx3QkFBd0IsYUFBYSxDQUFDLE9BQU8sZ0JBQWdCLGFBQWEsQ0FBQyxNQUFNLFdBQVcsRUFDM0wsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7YUFDSDtpQkFBTTtnQkFDTCx1QkFBVSxDQUFDLEdBQUcsQ0FDWiw0QkFBNEIsSUFBSSxDQUFDLGtCQUFrQiwrQkFBK0IsRUFDbEYsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7YUFDSDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksd0JBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUM1RCx1QkFBVSxDQUFDLEdBQUcsQ0FDWiw4RkFBOEYsRUFDOUYsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDL0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztTQUM5QjthQUFNO1lBQ0wsdUJBQVUsQ0FBQyxHQUFHLENBQ1osc0dBQXNHLEVBQ3RHLGtCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO1lBQ0YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFTyw0QkFBNEI7UUFDbEMsZ0RBQWdEO1FBQ2hELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUVoRSxJQUFJLFFBQVEsR0FBYTtZQUN2QixjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYztZQUNuRCxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYztZQUNuRCxpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQ25DLFFBQVEsRUFBRSxDQUFDO1NBQ1osQ0FBQztRQUNGLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUVhLGtCQUFrQjs7WUFDOUIsSUFBSTtnQkFDRixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0seUJBQWUsQ0FBQyxtQkFBbUIsQ0FDckQsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsVUFBVSxDQUNoQixDQUFDO2FBQ0g7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCx1QkFBVSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxrQkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqRSxPQUFPO2FBQ1I7WUFFRCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixrQ0FBa0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsRUFDdkgsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7UUFDSixDQUFDO0tBQUE7SUFFYSxpQkFBaUI7O1lBQzdCLGtDQUFrQztZQUNsQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbEMsMENBQTBDO2dCQUMxQyxJQUFJLGlCQUFpQixHQUFHLE1BQU0seUJBQWUsQ0FBQyxtQkFBbUIsQ0FDL0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUN4QixJQUFJLENBQUMsTUFBTSxFQUNYLEtBQUssRUFDTCxLQUFLLENBQ04sQ0FBQztnQkFFRixpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUU3RCxJQUFJLDRCQUE0QixHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQ2pFLFVBQVUsR0FBRyxFQUFFLENBQUM7b0JBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuRCxPQUFPLEdBQUcsQ0FBQztnQkFDYixDQUFDLEVBQ0QsRUFBRSxDQUNILENBQUM7Z0JBRUYsdUJBQVUsQ0FBQyxHQUFHLENBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxFQUM1QyxrQkFBVyxDQUFDLEtBQUssQ0FDbEIsQ0FBQztnQkFFRixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQ3ZDLDRCQUE0QixFQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDMUIsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLElBQUksV0FBVyxHQUFHLE1BQU0seUJBQWUsQ0FBQyxnQ0FBZ0MsQ0FDdEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUN4QixJQUFJLENBQUMsTUFBTSxDQUNaLENBQUM7Z0JBQ0YsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUN2QyxXQUFXLEVBQ1gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FDN0IsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBRWEsbUJBQW1COztZQUMvQix1QkFBdUI7WUFDdkIsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDOUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxLQUFLLEVBQWMsQ0FBQztnQkFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdDLHVCQUFVLENBQUMsR0FBRyxDQUNaLDBCQUEwQixLQUFLLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixJQUFJLEVBQ2pFLGtCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO29CQUNGLElBQUk7d0JBQ0YsSUFBSSxVQUFVLEdBQWUsTUFBTSx5QkFBZSxDQUFDLGdCQUFnQixDQUNqRSxJQUFJLENBQUMsSUFBSSxFQUNULEtBQUssRUFDTCxRQUFRLENBQUMsUUFBUSxFQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFDckMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUMvRCxJQUFJLENBQUMsTUFBTSxDQUNaLENBQUM7d0JBQ0YsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3RDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztxQkFDdkI7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBQ2QsdUJBQVUsQ0FBQyxHQUFHLENBQ1osb0NBQW9DLEtBQUssUUFBUSxFQUNqRCxrQkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztxQkFDSDtvQkFDRCxLQUFLLEVBQUUsQ0FBQztpQkFDVDtnQkFFRCxNQUFNLHlCQUFlLENBQUMscUJBQXFCLENBQ3pDLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLElBQUksQ0FBQyxNQUFNLENBQ1osQ0FBQztnQkFFRixJQUFJLHlCQUFlLENBQUMsc0JBQXNCLEVBQUU7b0JBQzFDLElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO29CQUU5QixRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO3dCQUMxQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7NEJBQ3hCLEVBQUUsRUFBRSxVQUFVLENBQUMsUUFBUTs0QkFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUc7NEJBQ3BDLG9CQUFvQixFQUFFLGFBQWE7eUJBQ3BDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ25DLGNBQWM7d0JBQ2QsTUFBTSx5QkFBZSxDQUFDLGlCQUFpQixDQUNyQyxvQkFBb0IsRUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUFDO3FCQUNIO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDO0tBQUE7SUFFYSw0QkFBNEI7O1lBSXhDLDBCQUEwQjtZQUMxQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDZixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFaEIsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDOUMsS0FBSyxJQUFJLFVBQVUsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO29CQUMzQyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTt3QkFDL0IsT0FBTyxFQUFFLENBQUM7d0JBQ1YsU0FBUztxQkFDVjtvQkFFRCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixpQ0FBaUMsVUFBVSxDQUFDLFFBQVEsZUFBZSxVQUFVLENBQUMsS0FBSyxzQkFBc0IsRUFDekcsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7b0JBRUYsSUFBSTt3QkFDRixrREFBa0Q7d0JBRWxELElBQUksd0JBQXdCLEdBQUcsTUFBTSx5QkFBZSxDQUFDLDBDQUEwQyxDQUM3RixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxVQUFVLEVBQ2YsVUFBVSxDQUFDLEtBQUssQ0FDakIsQ0FBQzt3QkFFRixNQUFNLHlCQUFlLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTs0QkFDbEQsd0JBQXdCO3lCQUN6QixDQUFDLENBQUM7d0JBQ0gsdUJBQVUsQ0FBQyxHQUFHLENBQ1osbUNBQW1DLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFDeEQsa0JBQVcsQ0FBQyxLQUFLLENBQ2xCLENBQUM7cUJBQ0g7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBQ2QsdUJBQVUsQ0FBQyxHQUFHLENBQ1osbUNBQW1DLFVBQVUsQ0FBQyxRQUFRLElBQUksRUFDMUQsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7cUJBQ0g7b0JBRUQsTUFBTSxFQUFFLENBQUM7aUJBQ1Y7YUFDRjtZQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUM5QyxDQUFDO0tBQUE7SUFFTyx5QkFBeUIsQ0FDL0Isb0JBQTRCLEVBQzVCLHdCQUFnQyxFQUNoQyxHQUFXLEVBQ1gsUUFBa0I7UUFFbEIsdUJBQVUsQ0FBQyxHQUFHLENBQ1osdUJBQXVCLEdBQUcsb0JBQW9CLEVBQzlDLGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO1FBQ0YsUUFBUSxDQUFDLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLFFBQVEsQ0FBQyxjQUFjO1lBQ3JCLFFBQVEsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixHQUFHLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0I7Z0JBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFUixJQUNFLFFBQVEsQ0FBQyxjQUFjLEdBQUcsQ0FBQztZQUMzQixRQUFRLENBQUMsY0FBYyxJQUFJLG9CQUFvQixFQUMvQztZQUNBLFFBQVEsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQztTQUNoRDthQUFNLElBQ0wsUUFBUSxDQUFDLGNBQWMsR0FBRyxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLEVBQzlDO1lBQ0EsUUFBUSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQztTQUM3QztRQUVELHVCQUFVLENBQUMsR0FBRyxDQUNaLHFCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQ2hELGtCQUFXLENBQUMsS0FBSyxDQUNsQixDQUFDO1FBQ0YsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDO0lBQzlCLENBQUM7SUFFTywwQkFBMEIsQ0FDaEMsb0JBQTRCLEVBQzVCLDRCQUFpQyxFQUNqQyxTQUFxQjtRQUVyQixJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUUzQiw4Q0FBOEM7UUFDOUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxJQUFJLG1CQUFtQixHQUFXLENBQUMsRUFDakMsbUJBQW1CLEdBQVcsQ0FBQyxDQUFDO1FBRWxDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUM3Qix1QkFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUV6QixJQUFJLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkQsUUFBUSxDQUFDLGtCQUFrQjtvQkFDekIsNEJBQTRCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRCxRQUFRLENBQUMsY0FBYztvQkFDckIsUUFBUSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsQ0FBQzt3QkFDdkQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGtCQUFrQjt3QkFDdkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDUixRQUFRLENBQUMsY0FBYztvQkFDckIsUUFBUSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsQ0FBQzt3QkFDdkQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGtCQUFrQjt3QkFDdkQsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNUO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Z0JBQ2hDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQztnQkFDbEQsUUFBUSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDO2FBQ25EO1lBQ0QsbUJBQW1CLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQztZQUMvQyxtQkFBbUIsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO1FBRUgsWUFBWTtRQUVaLElBQUksbUJBQW1CLElBQUksb0JBQW9CLEVBQUU7WUFDL0MsNEJBQTRCO1lBQzVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0IsUUFBUSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDO2dCQUMvQyxrQkFBa0IsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTSxJQUFJLG1CQUFtQixJQUFJLG9CQUFvQixFQUFFO1lBQ3RELGNBQWM7WUFDZCxvQ0FBb0M7WUFFcEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM3QixRQUFRLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUM7Z0JBQy9DLGtCQUFrQixJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxzQkFBc0I7WUFDdEIsSUFBSSxRQUFRLEdBQUcsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7WUFFMUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQiwwQ0FBMEM7Z0JBQzFDLE9BQU8sUUFBUSxHQUFHLENBQUMsRUFBRTtvQkFDbkIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO3dCQUM3QixJQUFJLFFBQVEsSUFBSSxDQUFDOzRCQUFFLE9BQU87d0JBQzFCLElBQ0UsUUFBUSxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxXQUFXOzRCQUNsRCxRQUFRLENBQUMsY0FBYyxFQUN2Qjs0QkFDQSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ3ZCLGtCQUFrQixFQUFFLENBQUM7NEJBQ3JCLFFBQVEsRUFBRSxDQUFDO3lCQUNaO29CQUNILENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7U0FDRjthQUFNO1lBQ0wsSUFBSSxRQUFRLEdBQUcsb0JBQW9CLENBQUM7WUFFcEMsMENBQTBDO1lBQzFDLE9BQU8sUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDcEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUM3QixJQUNFLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsV0FBVzt3QkFDbEQsUUFBUSxDQUFDLGNBQWMsRUFDdkI7d0JBQ0EsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN2QixrQkFBa0IsRUFBRSxDQUFDO3dCQUVyQixRQUFRLEVBQUUsQ0FBQztxQkFDWjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1NBQ0Y7UUFFRCxPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7SUFFYSxjQUFjLENBQzFCLFVBQXNCOztZQUV0QixxQkFBcUI7WUFDckIsdUJBQVUsQ0FBQyxHQUFHLENBQ1osK0NBQStDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFDcEUsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFDRixNQUFNLFVBQVUsR0FBRyxNQUFNLGlCQUFVLENBQUMsTUFBTSxDQUFDO2dCQUN6QyxRQUFRLEVBQUUsTUFBTSxlQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuRSxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO2dCQUMxQyxPQUFPLDBCQUFnQixDQUFDLEtBQUssQ0FDM0IsVUFBVSxFQUNWLFVBQVUsQ0FBQyxRQUFRLEVBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFDcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQ3pDLENBQUM7YUFDSDtpQkFBTTtnQkFDTCxPQUFPLDBCQUFnQixDQUFDLEtBQUssQ0FDM0IsVUFBVSxFQUNWLFVBQVUsQ0FBQyxRQUFRLEVBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FDckMsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBRWEsY0FBYyxDQUMxQixjQUFjLEVBQ2QsVUFBc0IsRUFDdEIsY0FBYzs7WUFFZCxxQkFBcUI7WUFDckIsSUFBSSxHQUFHLENBQUM7WUFFUix1QkFBVSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsY0FBYyxFQUFFLEVBQUUsa0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV6RSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVoRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUMvQixHQUFHLEdBQUcsUUFBUSxjQUFjLEtBQUssVUFBVSxDQUFDLFFBQVEsS0FBSyxjQUFjLEdBQUcsQ0FBQzthQUM1RTtpQkFBTTtnQkFDTCxHQUFHLEdBQUcsY0FBYyxjQUFjLEtBQUssVUFBVSxDQUFDLFFBQVEsS0FBSyxjQUFjLEVBQUUsQ0FBQzthQUNqRjtZQUNELHVCQUFVLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLEVBQUUsRUFBRSxrQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlELHVCQUFVLENBQUMsR0FBRyxDQUNaLHdCQUF3QixVQUFVLENBQUMsS0FBSyxtQkFBbUIsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUNoRixrQkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQztZQUVGLHVCQUFVLENBQUMsR0FBRyxDQUNaLG1FQUFtRSxVQUFVLENBQUMsS0FBSyw2RkFBNkYsRUFDaEwsa0JBQVcsQ0FBQyxJQUFJLENBQ2pCLENBQUM7WUFFRixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLHVCQUF1QixVQUFVLENBQUMsS0FBSyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFMUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDckMsSUFBSSxFQUFFLEdBQUcsb0JBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNuRSxJQUFJLEtBQUssRUFBRTt3QkFDVCx1QkFBVSxDQUFDLEdBQUcsQ0FDWixnQ0FBZ0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUNyRCxrQkFBVyxDQUFDLElBQUksQ0FDakIsQ0FBQzt3QkFDRixVQUFVLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO3dCQUVwQyxPQUFPLENBQUM7NEJBQ04sU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTzs0QkFDdEIsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLFFBQVE7NEJBQ3ZDLE1BQU0sRUFBRSxTQUFTO3lCQUNsQixDQUFDLENBQUM7d0JBQ0gsT0FBTztxQkFDUjtvQkFFRCxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO29CQUVuQyxJQUNFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO3dCQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7d0JBQ3ZDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUM7d0JBRWhFLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7b0JBRXRDLElBQUksVUFBVSxDQUFDLGdCQUFnQixFQUFFO3dCQUMvQix1QkFBVSxDQUFDLEdBQUcsQ0FDWixrQ0FBa0MsVUFBVSxDQUFDLFFBQVEsZUFBZSxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQ3RGLGtCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO3dCQUNGLHlCQUFlLENBQUMsaUJBQWlCLENBQy9COzRCQUNFLEVBQUUsRUFBRSxVQUFVLENBQUMsUUFBUTs0QkFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUc7NEJBQ3BDLG9CQUFvQixFQUFFLHlCQUFlLENBQUMsc0JBQXNCO2dDQUMxRCxDQUFDLENBQUMsV0FBVztnQ0FDYixDQUFDLENBQUMsRUFBRTs0QkFDTixXQUFXLEVBQUUsVUFBVSxDQUFDLFFBQVE7eUJBQ2pDLEVBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUFDLElBQUksQ0FDSixDQUFDLE1BQWUsRUFBRSxFQUFFOzRCQUNsQixVQUFVLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDOzRCQUNuQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNsQixPQUFPLENBQUM7Z0NBQ04sU0FBUyxFQUFFLElBQUk7Z0NBQ2YsT0FBTyxFQUFFLGdEQUFnRDtnQ0FDekQsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLFFBQVE7Z0NBQ3ZDLE1BQU0sRUFBRSxTQUFTOzZCQUNsQixDQUFDLENBQUM7d0JBQ0wsQ0FBQyxFQUNELENBQUMsTUFBVyxFQUFFLEVBQUU7NEJBQ2QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDbEIsVUFBVSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQzs0QkFDcEMsT0FBTyxDQUFDO2dDQUNOLFNBQVMsRUFBRSxLQUFLO2dDQUNoQixPQUFPLEVBQUUsOENBQThDO2dDQUN2RCxrQkFBa0IsRUFBRSxVQUFVLENBQUMsUUFBUTtnQ0FDdkMsTUFBTSxFQUFFLFNBQVM7NkJBQ2xCLENBQUMsQ0FBQzt3QkFDTCxDQUFDLENBQ0YsQ0FBQztxQkFDSDtnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJO29CQUNqQyxFQUFFLENBQUMsY0FBYyxDQUFDLHVCQUF1QixVQUFVLENBQUMsS0FBSyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3pFLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLElBQUk7b0JBQ2pDLEVBQUUsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLFVBQVUsQ0FBQyxLQUFLLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekUsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtDQU9GO0FBL3JCRCxpQ0ErckJDIn0=
