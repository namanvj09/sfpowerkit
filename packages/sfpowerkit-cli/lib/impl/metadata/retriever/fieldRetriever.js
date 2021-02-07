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
const entityDefinitionRetriever_1 = __importDefault(
  require("./entityDefinitionRetriever")
);
const metadataInfo_1 = require("../metadataInfo");
const metadataFiles_1 = __importDefault(require("../metadataFiles"));
const QUERY =
  "SELECT Id, QualifiedApiName, EntityDefinitionId, DeveloperName, NamespacePrefix FROM FieldDefinition";
class FieldRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!FieldRetriever.instance) {
      FieldRetriever.instance = new FieldRetriever(org);
    }
    return FieldRetriever.instance;
  }
  getObjects() {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      let fieldsToReturn = [];
      if (!this.data && !this.dataLoaded) {
        let entityDefinitionUtils = entityDefinitionRetriever_1.default.getInstance(
          this.org
        );
        let objects = yield entityDefinitionUtils.getObjectForPermission();
        this.data = {};
        for (let i = 0; i < objects.length; i++) {
          let objectName = objects[i];
          _super.setQuery.call(
            this,
            QUERY +
              " WHERE EntityDefinition.QualifiedApiName ='" +
              objectName +
              "'"
          );
          let fields = yield _super.getObjects.call(this);
          fields = fields.map((field) => {
            field.SobjectType = objectName;
            field.FullName = objectName + "." + field.QualifiedApiName;
            return field;
          });
          this.data[objectName] = fields;
          fieldsToReturn.push(...fields);
        }
        this.dataLoaded = true;
      } else {
        if (this.data) {
          Object.keys(this.data).forEach((key) => {
            fieldsToReturn.push(...this.data[key]);
          });
        }
      }
      return fieldsToReturn;
    });
  }
  getFields() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  getFieldsByObjectName(objectName) {
    const _super = Object.create(null, {
      setQuery: { get: () => super.setQuery },
      getObjects: { get: () => super.getObjects },
    });
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.data) {
        yield this.getObjects();
      }
      if (!this.data[objectName]) {
        let fields = [];
        _super.setQuery.call(
          this,
          QUERY +
            " WHERE EntityDefinition.QualifiedApiName ='" +
            objectName +
            "'"
        );
        fields = yield _super.getObjects.call(this);
        fields = fields.map((field) => {
          field.SobjectType = objectName;
          field.FullName = objectName + "." + field.QualifiedApiName;
          return field;
        });
        this.data[objectName] = fields;
      }
      return this.data[objectName];
    });
  }
  fieldExist(fullName) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      let fieldParts = fullName.split(".");
      if (fieldParts.length !== 2) {
        return false;
      }
      let objectName = fieldParts[0];
      let fieldName = fieldParts[1];
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.CustomField.components)) {
        found = metadataInfo_1.METADATA_INFO.CustomField.components.includes(
          fullName
        );
        if (!found) {
          if (objectName === "Task" || objectName === "Event") {
            let activityFieldName = `Activity.${fieldName}`;
            found = metadataInfo_1.METADATA_INFO.CustomField.components.includes(
              activityFieldName
            );
          }
        }
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let fieldDefinitions = yield this.getFieldsByObjectName(objectName);
        let field = fieldDefinitions.find(
          (field) => field.FullName === fullName
        );
        found = field !== undefined;
      }
      return found;
    });
  }
}
exports.default = FieldRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGRSZXRyaWV2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW1wbC9tZXRhZGF0YS9yZXRyaWV2ZXIvZmllbGRSZXRyaWV2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMENBQTRCO0FBQzVCLG9GQUE0RDtBQUU1RCw0RkFBb0U7QUFDcEUsa0RBQWdEO0FBQ2hELHFFQUE2QztBQUU3QyxNQUFNLEtBQUssR0FDVCxzR0FBc0csQ0FBQztBQUN6RyxNQUFxQixjQUFlLFNBQVEsK0JBQTRCO0lBRXRFLFlBQTJCLEdBQVE7UUFDakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQURRLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ00sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFRO1FBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFO1lBQzVCLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkQ7UUFDRCxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUM7SUFDakMsQ0FBQztJQUNZLFVBQVU7Ozs7OztZQUNyQixJQUFJLGNBQWMsR0FBWSxFQUFFLENBQUM7WUFFakMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNsQyxJQUFJLHFCQUFxQixHQUFHLG1DQUF5QixDQUFDLFdBQVcsQ0FDL0QsSUFBSSxDQUFDLEdBQUcsQ0FDVCxDQUFDO2dCQUVGLElBQUksT0FBTyxHQUFHLE1BQU0scUJBQXFCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRWYsS0FBSyxJQUFJ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
