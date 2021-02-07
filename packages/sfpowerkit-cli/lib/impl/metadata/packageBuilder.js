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
var __asyncValues =
  (this && this.__asyncValues) ||
  function (o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator],
      i;
    return m
      ? m.call(o)
      : ((o =
          typeof __values === "function" ? __values(o) : o[Symbol.iterator]()),
        (i = {}),
        verb("next"),
        verb("throw"),
        verb("return"),
        (i[Symbol.asyncIterator] = function () {
          return this;
        }),
        i);
    function verb(n) {
      i[n] =
        o[n] &&
        function (v) {
          return new Promise(function (resolve, reject) {
            (v = o[n](v)), settle(resolve, reject, v.done, v.value);
          });
        };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function (v) {
        resolve({ value: v, done: d });
      }, reject);
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildConfig = exports.Packagexml = void 0;
const xml2js = __importStar(require("xml2js"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const fileutils_1 = __importDefault(require("../../utils/fileutils"));
const sfpowerkit_1 = require("../../sfpowerkit");
if (Symbol["asyncIterator"] === undefined) {
  // tslint:disable-next-line:no-any
  Symbol["asyncIterator"] = Symbol.for("asyncIterator");
}
const STANDARD_VALUE_SETS = [
  "AccountContactMultiRoles",
  "AccountContactRole",
  "AccountOwnership",
  "AccountRating",
  "AccountType",
  "AddressCountryCode",
  "AddressStateCode",
  "AssetStatus",
  "CampaignMemberStatus",
  "CampaignStatus",
  "CampaignType",
  "CaseContactRole",
  "CaseOrigin",
  "CasePriority",
  "CaseReason",
  "CaseStatus",
  "CaseType",
  "ContactRole",
  "ContractContactRole",
  "ContractStatus",
  "EntitlementType",
  "EventSubject",
  "EventType",
  "FiscalYearPeriodName",
  "FiscalYearPeriodPrefix",
  "FiscalYearQuarterName",
  "FiscalYearQuarterPrefix",
  "IdeaCategory",
  "IdeaMultiCategory",
  "IdeaStatus",
  "IdeaThemeStatus",
  "Industry",
  "InvoiceStatus",
  "LeadSource",
  "LeadStatus",
  "OpportunityCompetitor",
  "OpportunityStage",
  "OpportunityType",
  "OrderStatus",
  "OrderType",
  "PartnerRole",
  "Product2Family",
  "QuestionOrigin",
  "QuickTextCategory",
  "QuickTextChannel",
  "QuoteStatus",
  "SalesTeamRole",
  "Salutation",
  "ServiceContractApprovalStatus",
  "SocialPostClassification",
  "SocialPostEngagementLevel",
  "SocialPostReviewedStatus",
  "SolutionStatus",
  "TaskPriority",
  "TaskStatus",
  "TaskSubject",
  "TaskType",
  "WorkOrderLineItemStatus",
  "WorkOrderPriority",
  "WorkOrderStatus",
];
/**
 * This code was adapted from github:sfdx-jayree-plugin project which was
 * based on the original github:sfdx-hydrate project
 */
class Packagexml {
  constructor(conn, configs) {
    this.packageTypes = {};
    this.conn = conn;
    this.configs = configs;
    this.result = [];
  }
  build() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const folders = [];
        const unfolderedObjects = [];
        yield this.describeMetadata(unfolderedObjects, folders);
        yield this.buildInstalledPackageRegex();
        yield this.handleUnfolderedObjects(unfolderedObjects);
        yield this.handleFolderedObjects(folders);
        if (!this.packageTypes["StandardValueSet"]) {
          this.packageTypes["StandardValueSet"] = [];
        }
        STANDARD_VALUE_SETS.forEach((member) => {
          this.packageTypes["StandardValueSet"].push(member);
          this.result.push({
            type: "StandardValueSet",
            fullName: member,
          });
        });
        let packageXml = this.generateXml();
        let dir = path.parse(this.configs.outputFile).dir;
        if (!fs.existsSync(dir)) {
          fileutils_1.default.mkDirByPathSync(dir);
        }
        fs.writeFileSync(this.configs.outputFile, packageXml);
        return packageXml;
      } catch (err) {
        console.log(err);
      }
    });
  }
  buildInstalledPackageRegex() {
    return __awaiter(this, void 0, void 0, function* () {
      // fetch and execute installed package promise to build regex
      let ipRegexStr = "^(";
      if (this.ipPromise) {
        this.ipPromise.then((instPack) => {
          instPack.forEach((pkg) => {
            ipRegexStr += pkg.namespacePrefix + "|";
          });
          ipRegexStr += ")+__";
          this.ipRegex = RegExp(ipRegexStr);
        });
      } else {
        this.ipRegex = RegExp("");
      }
    });
  }
  describeMetadata(unfolderedObjects, folders) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
      const describe = yield this.conn.metadata.describe(
        this.configs.apiVersion
      );
      try {
        for (
          var _b = __asyncValues(describe.metadataObjects), _c;
          (_c = yield _b.next()), !_c.done;

        ) {
          const object = _c.value;
          if (
            this.configs.quickFilters.length !== 0 &&
            this.configs.quickFilters.includes(object.xmlName)
          ) {
            continue;
          }
          if (object.inFolder) {
            const objectType = object.xmlName.replace("Template", "");
            const promise = this.conn.metadata.list(
              {
                type: `${objectType}Folder`,
              },
              this.configs.apiVersion
            );
            folders.push(promise);
          } else {
            const promise = this.conn.metadata.list(
              {
                type: object.xmlName,
              },
              this.configs.apiVersion
            );
            if (object.xmlName === "InstalledPackage") {
              this.ipPromise = promise.then(); // clone promise
            }
            unfolderedObjects.push(promise);
            if (
              object.childXmlNames &&
              object.childXmlNames.length > 0 &&
              this.configs.includeChilds
            ) {
              for (let child of object.childXmlNames) {
                if (child === "ManagedTopic") {
                  continue;
                }
                const promise = this.conn.metadata.list(
                  {
                    type: child,
                  },
                  this.configs.apiVersion
                );
                unfolderedObjects.push(promise);
              }
            }
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    });
  }
  generateXml() {
    const packageJson = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      types: [],
      version: this.configs.apiVersion,
    };
    let mdtypes = Object.keys(this.packageTypes);
    mdtypes.sort();
    mdtypes.forEach((mdtype) => {
      if (
        this.configs.quickFilters.length === 0 ||
        !this.configs.quickFilters.includes(mdtype)
      ) {
        packageJson.types.push({
          name: mdtype,
          members: this.packageTypes[mdtype].sort(),
        });
      }
    });
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "utf-8" },
    });
    let packageObj = {
      Package: packageJson,
    };
    let packageXml = builder.buildObject(packageObj);
    return packageXml;
  }
  handleFolderedObjects(folders) {
    var folders_1, folders_1_1;
    var e_2, _a, e_3, _b;
    return __awaiter(this, void 0, void 0, function* () {
      const folderedObjects = [];
      try {
        for (
          folders_1 = __asyncValues(folders);
          (folders_1_1 = yield folders_1.next()), !folders_1_1.done;

        ) {
          const folder = folders_1_1.value;
          let folderItems = [];
          if (Array.isArray(folder)) {
            folderItems = folder;
          } else if (folder) {
            folderItems = [folder];
          }
          if (folderItems.length > 0) {
            try {
              for (
                var folderItems_1 =
                    ((e_3 = void 0), __asyncValues(folderItems)),
                  folderItems_1_1;
                (folderItems_1_1 = yield folderItems_1.next()),
                  !folderItems_1_1.done;

              ) {
                const folderItem = folderItems_1_1.value;
                if (folderItem) {
                  this.result.push(folderItem);
                  let objectType = folderItem.type.replace("Folder", "");
                  if (objectType === "Email") {
                    objectType += "Template";
                  }
                  this.addMember(objectType, folderItem);
                  const promise = this.conn.metadata.list(
                    {
                      type: objectType,
                      folder: folderItem.fullName,
                    },
                    this.configs.apiVersion
                  );
                  folderedObjects.push(promise);
                }
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (
                  folderItems_1_1 &&
                  !folderItems_1_1.done &&
                  (_b = folderItems_1.return)
                )
                  yield _b.call(folderItems_1);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }
        }
      } catch (e_2_1) {
        e_2 = { error: e_2_1 };
      } finally {
        try {
          if (folders_1_1 && !folders_1_1.done && (_a = folders_1.return))
            yield _a.call(folders_1);
        } finally {
          if (e_2) throw e_2.error;
        }
      }
      (yield Promise.all(folderedObjects)).forEach((folderedObject) => {
        try {
          if (folderedObject) {
            let folderedObjectItems = [];
            if (Array.isArray(folderedObject)) {
              folderedObjectItems = folderedObject;
            } else {
              folderedObjectItems = [folderedObject];
            }
            folderedObjectItems.forEach((metadataEntries) => {
              if (metadataEntries) {
                this.addMember(metadataEntries.type, metadataEntries);
                this.result.push(metadataEntries);
              } else {
                console.log("No metadataEntry available");
              }
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }
  handleUnfolderedObjects(unfolderedObjects) {
    return __awaiter(this, void 0, void 0, function* () {
      (yield Promise.all(unfolderedObjects)).forEach((unfolderedObject) => {
        try {
          if (unfolderedObject) {
            let unfolderedObjectItems = [];
            if (Array.isArray(unfolderedObject)) {
              unfolderedObjectItems = unfolderedObject;
            } else {
              unfolderedObjectItems = [unfolderedObject];
            }
            unfolderedObjectItems.forEach((metadataEntries) => {
              if (metadataEntries) {
                if (
                  this.configs.quickFilters.length !== 0 &&
                  this.configs.quickFilters.includes(
                    metadataEntries.type + ":" + metadataEntries.fullName
                  )
                ) {
                  return;
                }
                this.addMember(metadataEntries.type, metadataEntries);
                this.result.push(metadataEntries);
              } else {
                console.log("No metadataEntry available");
              }
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }
  addMember(type, member) {
    /**
     * Managed package - fullName starts with 'namespacePrefix__' || namespacePrefix is not null || manageableState = installed
     * Unmanaged package - manageableState = unmanaged
     * Regular custom objects - manageableState = unmanaged or undefined
     */
    if (
      type &&
      !(typeof type === "object") &&
      !(
        this.configs.excludeManaged &&
        (this.ipRegex.test(member.fullName) ||
          member.namespacePrefix ||
          member.manageableState === "installed")
      )
    ) {
      try {
        if (member.fileName.includes("ValueSetTranslation")) {
          const x =
            member.fileName.split(".")[1].substring(0, 1).toUpperCase() +
            member.fileName.split(".")[1].substring(1);
          if (!this.packageTypes[x]) {
            this.packageTypes[x] = [];
          }
          this.packageTypes[x].push(member.fullName);
        } else {
          if (!this.packageTypes[type]) {
            this.packageTypes[type] = [];
          }
          if (
            member.type === "Layout" &&
            member.namespacePrefix &&
            member.manageableState === "installed"
          ) {
            const { fullName, namespacePrefix } = member;
            let objectName = fullName.substr(0, fullName.indexOf("-"));
            let layoutName = fullName.substr(fullName.indexOf("-") + 1);
            this.packageTypes[type].push(
              objectName + "-" + namespacePrefix + "__" + layoutName
            );
          } else {
            this.packageTypes[type].push(member.fullName);
          }
        }
      } catch (ex) {
        sfpowerkit_1.SFPowerkit.log(
          "Type " + JSON.stringify(type),
          sfpowerkit_1.LoggerLevel.DEBUG
        );
      }
    }
  }
}
exports.Packagexml = Packagexml;
class BuildConfig {
  constructor(flags, apiVersion) {
    // flags always take precendence over configs from file
    this.excludeManaged = flags["excludemanaged"];
    this.includeChilds = flags["includechilds"];
    this.apiVersion = flags["apiversion"] || apiVersion;
    this.quickFilters = flags["quickfilter"]
      ? flags["quickfilter"].split(",").map((elem) => {
          return elem.trim();
        })
      : [];
    this.outputFile = flags["outputfile"] || "package.xml";
  }
}
exports.BuildConfig = BuildConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9wYWNrYWdlQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLCtDQUFpQztBQUNqQyw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLHNFQUE4QztBQUU5QyxpREFBMkQ7QUFFM0QsSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssU0FBUyxFQUFFO0lBQ3pDLGtDQUFrQztJQUNqQyxNQUFjLENBQUMsZUFBZSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNoRTtBQUVELE1BQU0sbUJBQW1CLEdBQUc7SUFDMUIsMEJBQTBCO0lBQzFCLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsZUFBZTtJQUNmLGFBQWE7SUFDYixvQkFBb0I7SUFDcEIsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsZ0JBQWdCO0lBQ2hCLGNBQWM7SUFDZCxpQkFBaUI7SUFDakIsWUFBWTtJQUNaLGNBQWM7SUFDZCxZQUFZO0lBQ1osWUFBWTtJQUNaLFVBQVU7SUFDVixhQUFhO0lBQ2IscUJBQXFCO0lBQ3JCLGdCQUFnQjtJQUNoQixpQkFBaUI7SUFDakIsY0FBYztJQUNkLFdBQVc7SUFDWCxzQkFBc0I7SUFDdEIsd0JBQXdCO0lBQ3hCLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsY0FBYztJQUNkLG1CQUFtQjtJQUNuQixZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLFVBQVU7SUFDVixlQUFlO0lBQ2YsWUFBWTtJQUNaLFlBQVk7SUFDWix1QkFBdUI7SUFDdkIsa0JBQWtCO0lBQ2xCLGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsV0FBVztJQUNYLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLG1C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
