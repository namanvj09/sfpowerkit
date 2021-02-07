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
const metadataInfo_1 = require("../metadataInfo");
const metadataFiles_1 = __importDefault(require("../metadataFiles"));
const sfpowerkit_1 = require("../../../sfpowerkit");
const sfpowerkit_2 = require("../../../sfpowerkit");
const QUERY =
  "SELECT DurableId, DeveloperName, QualifiedApiName, NamespacePrefix FROM EntityDefinition order by QualifiedApiName";
class EntityDefinitionRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, false);
    this.org = org;
    this.describePromise = null;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!EntityDefinitionRetriever.instance) {
      EntityDefinitionRetriever.instance = new EntityDefinitionRetriever(org);
    }
    return EntityDefinitionRetriever.instance;
  }
  getObjects() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.describePromise !== null) {
        return this.describePromise;
      }
      this.describePromise = new Promise((resolve, reject) => {
        this.org.getConnection().describeGlobal(function (err, res) {
          if (err) {
            sfpowerkit_1.SFPowerkit.log(
              `Error when running gllobal describe `,
              sfpowerkit_2.LoggerLevel.ERROR
            );
            sfpowerkit_1.SFPowerkit.log(err, sfpowerkit_2.LoggerLevel.ERROR);
            reject(err);
          } else {
            sfpowerkit_1.SFPowerkit.log(
              `Org describe completed successfully. ${res.sobjects.length} object found! `,
              sfpowerkit_2.LoggerLevel.INFO
            );
            let entities = res.sobjects.map((sObject) => {
              return {
                QualifiedApiName: sObject.name,
              };
            });
            resolve(entities);
          }
        });
      });
      return this.describePromise;
    });
  }
  getEntityDefinitions() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  getObjectForPermission() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.objectForPermission && this.objectForPermission.length > 0) {
        return this.objectForPermission;
      }
      this.objectForPermission = [];
      yield this.org.refreshAuth();
      let res = yield this.org
        .getConnection()
        .query(
          "SELECT SobjectType, count(Id) From ObjectPermissions Group By sObjectType"
        );
      if (res !== undefined) {
        this.objectForPermission = res.records.map((elem) => {
          return elem["SobjectType"];
        });
      }
      if (!this.objectForPermission.includes("PersonAccount")) {
        this.objectForPermission.push("PersonAccount");
      }
      return this.objectForPermission;
    });
  }
  existObjectPermission(object) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomObject.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomObject.components.includes(
          object
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let objects = yield this.getObjectForPermission();
        found = objects.includes(object);
      }
      return found;
    });
  }
  existCustomMetadata(custonObjectStr) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomObject.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomObject.components.includes(
          custonObjectStr
        );
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let objects = yield this.getObjects();
        let foundObj = objects.find((obj) => {
          return obj.QualifiedApiName === custonObjectStr;
        });
        found = foundObj !== undefined;
      }
      return found;
    });
  }
}
exports.default = EntityDefinitionRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5RGVmaW5pdGlvblJldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci9lbnRpdHlEZWZpbml0aW9uUmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDBDQUE0QjtBQUM1QixvRkFBNEQ7QUFFNUQsa0RBQWdEO0FBQ2hELHFFQUE2QztBQUM3QyxvREFBaUQ7QUFDakQsb0RBQWtEO0FBRWxELE1BQU0sS0FBSyxHQUNULG9IQUFvSCxDQUFDO0FBRXZILE1BQXFCLHlCQUEwQixTQUFRLCtCQUV0RDtJQUlDLFlBQTJCLEdBQVE7UUFDakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQURPLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFEM0Isb0JBQWUsR0FBRyxJQUFJLENBQUM7UUFHN0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFRO1FBQ2hDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUU7WUFDdkMseUJBQXlCLENBQUMsUUFBUSxHQUFHLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekU7UUFDRCxPQUFPLHlCQUF5QixDQUFDLFFBQVEsQ0FBQztJQUM1QyxDQUFDO0lBRVksVUFBVTs7WUFDckIsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO2FBQzdCO1lBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFB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
