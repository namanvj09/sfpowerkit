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
const getDefaults_1 = __importDefault(require("../../../utils/getDefaults"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const chunkArray_1 = require("../../../utils/chunkArray");
const progressBar_1 = require("../../../ui/progressBar");
const getDefaults_2 = __importDefault(require("../../../utils/getDefaults"));
const util_1 = require("util");
const retry = require("async-retry");
class MetadataSummaryInfoFetcher {
  static fetchMetadataSummaryFromAnOrg(
    conn,
    isDisplayProgressBar = false,
    filterTypes = MetadataSummaryInfoFetcher.NotSupportedTypes
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      let metadataMap = new Map();
      let types = [];
      let result = yield conn.metadata.describe(
        getDefaults_1.default.getApiVersion()
      );
      result.metadataObjects.forEach((metadata) => {
        //Not supported .. ignore
        if (!this.NotSupportedTypes.includes(metadata.xmlName)) {
          types.push({ type: metadata.xmlName });
        }
        //Has childs.. check for each child and add to the list
        if (metadata.childXmlNames) {
          for (let childMetadata of metadata.childXmlNames) {
            if (!this.NotSupportedTypes.includes(childMetadata)) {
              types.push({ type: childMetadata });
            }
          }
        }
      });
      let progressBar = new progressBar_1.ProgressBar().create(
        `Fetching  Metadata  Types From the Org `,
        ` metdata types`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      progressBar.start(types.length);
      //Fetch Summary Info in chunks of three
      for (let typesInChunk of chunkArray_1.chunkArray(3, types)) {
        try {
          metadataMap = yield this.fetchMetadataSummaryByTypesFromAnOrg(
            conn,
            typesInChunk,
            metadataMap
          );
          progressBar.increment(typesInChunk.length);
        } catch (error) {
          if (error.message == "Undefinded Metadata Type") {
            sfpowerkit_1.SFPowerkit.log(
              `Unknown Types ${JSON.stringify(
                typesInChunk
              )} Encountered while retrieving types from the org, Please raise an issue!`,
              sfpowerkit_1.LoggerLevel.WARN
            );
          } else {
            progressBar.stop();
            throw new core_1.SfdxError(error);
          }
        }
      }
      progressBar.stop();
      return metadataMap;
    });
  }
  static fetchMetadataSummaryByTypesFromAnOrg(conn, types, metadataMap) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield retry(
        (bail) =>
          __awaiter(this, void 0, void 0, function* () {
            let results = yield conn.metadata.list(
              types,
              getDefaults_2.default.getApiVersion()
            );
            if (!util_1.isArray(results)) {
              throw new Error("Undefinded Metadata Type");
            }
            // if (results.length > 0)
            for (let result of results) {
              metadataMap.set(result.id, {
                id: result.id,
                fullName: result.fullName,
                type: result.type,
              });
            }
            return metadataMap;
          }),
        { retries: 3, minTimeout: 2000 }
      );
    });
  }
}
exports.default = MetadataSummaryInfoFetcher;
MetadataSummaryInfoFetcher.NotSupportedTypes = [
  "AccountForecastSettings",
  "Icon",
  "GlobalValueSet",
  "StandardValueSet",
  "CustomPermission",
  "EscalationRules",
  "RecordActionDeployment",
  "EscalationRule",
  "ApprovalProcess",
  "SiteDotCom",
  "BrandingSet",
  "NetworkBranding",
  "AuthProvider",
  "ContentAsset",
  "CustomSite",
  "EmbeddedServiceConfig",
  "UIObjectRelationConfig",
  "CareProviderSearchConfig",
  "EmbeddedServiceBranding",
  "EmbeddedServiceFlowConfig",
  "EmbeddedServiceMenuSettings",
  "SalesAgreementSettings",
  "ActionLinkGroupTemplate",
  "TransactionSecurityPolicy",
  "SynonymDictionary",
  "RecommendationStrategy",
  "UserCriteria",
  "ModerationRule",
  "CMSConnectSource",
  "FlowCategory",
  "Settings",
  "PlatformCachePartition",
  "LightningBolt",
  "LightningExperienceTheme",
  "LightningOnboardingConfig",
  "CorsWhitelistOrigin",
  "CustomHelpMenuSection",
  "Prompt",
  "Report",
  "Dashboard",
  "AnalyticSnapshot",
  "Role",
  "Group",
  "Community",
  "ChatterExtension",
  "PlatformEventChannel",
  "CommunityThemeDefinition",
  "CommunityTemplateDefinition",
  "NavigationMenu",
  "ManagedTopics",
  "ManagedTopic",
  "KeywordList",
  "InstalledPackage",
  "Scontrol",
  "Certificate",
  "LightningMessageChannel",
  "CaseSubjectParticle",
  "ExternalDataSource",
  "ExternalServiceRegistration",
  "Index",
  "CustomFeedFilter",
  "PostTemplate",
  "ProfilePasswordPolicy",
  "ProfileSessionSetting",
  "MyDomainDiscoverableLogin",
  "OauthCustomScope",
  "LeadConvertSettings",
  "DataCategoryGroup",
  "RemoteSiteSetting",
  "CspTrustedSite",
  "RedirectWhitelistUrl",
  "CleanDataService",
  "Skill",
  "ServiceChannel",
  "QueueRoutingConfig",
  "ServicePresenceStatus",
  "PresenceDeclineReason",
  "PresenceUserConfig",
  "EclairGeoData",
  "ChannelLayout",
  "CallCenter",
  "TimeSheetTemplate",
  "CanvasMetadata",
  "MobileApplicationDetail",
  "CustomNotificationType",
  "NotificationTypeConfig",
  "DelegateGroup",
  "ManagedContentType",
  "EmailServicesFunction",
  "SamlSsoConfig",
  "EmbeddedServiceLiveAgent",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFTdW1tYXJ5SW5mb0ZldGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9yZXRyaWV2ZXIvbWV0YWRhdGFTdW1tYXJ5SW5mb0ZldGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBeUQ7QUFDekQsNkVBQXFEO0FBQ3JELG9EQUE4RDtBQUU5RCwwREFBdUQ7QUFDdkQseURBQXNEO0FBQ3RELDZFQUFxRDtBQUNyRCwrQkFBK0I7QUFDL0IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXJDLE1BQXFCLDBCQUEwQjtJQStGdEMsTUFBTSxDQUFPLDZCQUE2QixDQUMvQyxJQUFnQixFQUNoQix1QkFBZ0MsS0FBSyxFQUNyQyxjQUF3QiwwQkFBMEIsQ0FBQyxpQkFBaUI7O1lBRXBFLElBQUksV0FBVyxHQUFpQyxJQUFJLEdBQUcsRUFHcEQsQ0FBQztZQUNKLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUVmLElBQUksTUFBTSxHQUEyQixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUMvRCxxQkFBVyxDQUFDLGFBQWEsRUFBRSxDQUM1QixDQUFDO1lBRUYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hDLHlCQUF5QjtnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN0RCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUN4QztnQkFFRCx1REFBdUQ7Z0JBQ3ZELElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRTtvQkFDMUIsS0FBSyxJQUFJLGFBQWEsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFF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
