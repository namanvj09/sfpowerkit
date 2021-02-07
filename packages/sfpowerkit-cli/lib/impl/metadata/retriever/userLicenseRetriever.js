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
const _ = __importStar(require("lodash"));
const baseMetadataRetriever_1 = __importDefault(
  require("./baseMetadataRetriever")
);
const QUERY = "Select Id, Name, LicenseDefinitionKey From UserLicense";
class UserLicenseRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, false);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!UserLicenseRetriever.instance) {
      UserLicenseRetriever.instance = new UserLicenseRetriever(org);
    }
    return UserLicenseRetriever.instance;
  }
  getObjects() {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      if (
        (this.data === undefined || this.data.length == 0) &&
        !this.dataLoaded
      ) {
        _super.setQuery.call(this, QUERY);
        this.data = yield _super.getObjects.call(this);
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  getUserLicenses() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  userLicenseExists(license) {
    return __awaiter(this, void 0, void 0, function* () {
      let licenses = yield this.getUserLicenses();
      let foundLicense = licenses.find((aLicense) => {
        return aLicense.Name === license;
      });
      return !_.isNil(foundLicense);
    });
  }
}
exports.default = UserLicenseRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckxpY2Vuc2VSZXRyaWV2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9yZXRyaWV2ZXIvdXNlckxpY2Vuc2VSZXRyaWV2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMENBQTRCO0FBQzVCLG9GQUE0RDtBQUU1RCxNQUFNLEtBQUssR0FBRyx3REFBd0QsQ0FBQztBQUN2RSxNQUFxQixvQkFBcUIsU0FBUSwrQkFFakQ7SUFFQyxZQUEyQixHQUFRO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFETyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBUTtRQUNoQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFO1lBQ2xDLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQy9EO1FBQ0QsT0FBTyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7SUFDdkMsQ0FBQztJQUVZLFVBQVU7Ozs7OztZQUNyQixJQUNFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ2hCO2dCQUNBLE9BQU0sUUFBUSxZQUFDLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLE9BQU0sVUFBVSxXQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ3hCO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25CLENBQUM7S0FBQTtJQUNZLGVBQWU7O1lBQzFCLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0lBRVksaUJBQWlCLENBQUMsT0FBZTs7WUFDNUMsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDNUMsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hDLENBQUM7S0FBQTtDQUNGO0FBdENELHVDQXNDQyJ9
