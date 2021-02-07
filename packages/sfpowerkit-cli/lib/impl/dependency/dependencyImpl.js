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
const sfpowerkit_1 = require("../../sfpowerkit");
const queryExecutor_1 = __importDefault(require("../../utils/queryExecutor"));
const chunkArray_1 = require("../../utils/chunkArray");
const progressBar_1 = require("../../ui/progressBar");
class DependencyImpl {
  static getDependencyMapById(conn, refMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
      let progressBar = new progressBar_1.ProgressBar().create(
        `Fetching dependency details `,
        ` metadata components`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      progressBar.start(refMetadata.length);
      let dependencyMap = new Map();
      let dependencyDetailsMap = new Map();
      let filterOn = " RefMetadataComponentId ";
      for (let chunkrefMetadata of chunkArray_1.chunkArray(500, refMetadata)) {
        const results = yield this.fetchDependencies(
          conn,
          filterOn,
          chunkrefMetadata,
          dependencyMap,
          dependencyDetailsMap
        );
        if (results) {
          dependencyMap = results.dependencyMap;
          dependencyDetailsMap = results.dependencyDetailsMap;
        }
        progressBar.increment(chunkrefMetadata.length);
      }
      progressBar.stop();
      return {
        dependencyMap: dependencyMap,
        dependencyDetailsMap: dependencyDetailsMap,
      };
    });
  }
  static getDependencyMapByType(conn, refMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
      let progressBar = new progressBar_1.ProgressBar().create(
        `Fetching dependency details `,
        ` metadata components`,
        sfpowerkit_1.LoggerLevel.INFO
      );
      progressBar.start(refMetadata.length);
      let dependencyMap = new Map();
      let dependencyDetailsMap = new Map();
      let filterOn = " RefMetadataComponentType ";
      if (refMetadata.length > 500) {
        for (let chunkrefMetadata of chunkArray_1.chunkArray(
          500,
          refMetadata
        )) {
          const results = yield this.fetchDependencies(
            conn,
            filterOn,
            chunkrefMetadata,
            dependencyMap,
            dependencyDetailsMap
          );
          if (results) {
            dependencyMap = results.dependencyMap;
            dependencyDetailsMap = results.dependencyDetailsMap;
          }
          progressBar.increment(chunkrefMetadata.length);
        }
      } else {
        const results = yield this.fetchDependencies(
          conn,
          filterOn,
          refMetadata,
          dependencyMap,
          dependencyDetailsMap
        );
        if (results) {
          dependencyMap = results.dependencyMap;
          dependencyDetailsMap = results.dependencyDetailsMap;
        }
        progressBar.increment(refMetadata.length);
      }
      progressBar.stop();
      return {
        dependencyMap: dependencyMap,
        dependencyDetailsMap: dependencyDetailsMap,
      };
    });
  }
  static fetchDependencies(
    conn,
    filterOn,
    refMetadata,
    dependencyMap,
    dependencyDetailsMap
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        `SELECT MetadataComponentId, MetadataComponentNamespace, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentNamespace, ` +
        `RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency where ${filterOn} IN ('` +
        refMetadata.join(`','`) +
        `') `;
      let queryUtil = new queryExecutor_1.default(conn);
      let result = yield queryUtil.executeQuery(query, true);
      let memberList = [];
      result.forEach((element) => {
        memberList = dependencyMap.get(element.RefMetadataComponentId) || [];
        memberList.push(element.MetadataComponentId);
        dependencyMap.set(element.RefMetadataComponentId, memberList);
        dependencyDetailsMap.set(element.MetadataComponentId, {
          id: element.MetadataComponentId,
          fullName: element.MetadataComponentName,
          type: element.MetadataComponentType,
        });
        dependencyDetailsMap.set(element.RefMetadataComponentId, {
          id: element.RefMetadataComponentId,
          fullName: element.RefMetadataComponentName,
          type: element.RefMetadataComponentType,
        });
      });
      return {
        dependencyMap: dependencyMap,
        dependencyDetailsMap: dependencyDetailsMap,
      };
    });
  }
  static getMemberVsPackageMap(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        `SELECT CurrentPackageVersionId, MaxPackageVersionId, MinPackageVersionId, SubjectId, SubjectKeyPrefix, SubjectManageableState, SubscriberPackageId ` +
        `FROM Package2Member  WHERE (SubjectManageableState = 'installed' OR SubjectManageableState = 'installedEditable') ORDER BY SubjectId `;
      let queryUtil = new queryExecutor_1.default(conn);
      let result = yield queryUtil.executeQuery(query, true);
      let packageMember = new Map();
      if (result) {
        result.forEach((cmp) => {
          packageMember.set(cmp.SubjectId, cmp.SubscriberPackageId);
        });
      }
      return packageMember;
    });
  }
  static getPackageVsMemberMap(conn) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        `SELECT CurrentPackageVersionId, MaxPackageVersionId, MinPackageVersionId, SubjectId, SubjectKeyPrefix, SubjectManageableState, SubscriberPackageId ` +
        `FROM Package2Member  WHERE (SubjectManageableState = 'installed' OR SubjectManageableState = 'installedEditable') ORDER BY SubjectId `;
      let queryUtil = new queryExecutor_1.default(conn);
      let result = yield queryUtil.executeQuery(query, true);
      let packageMember = new Map();
      let memberList = [];
      if (result) {
        result.forEach((cmp) => {
          memberList = packageMember.get(cmp.SubscriberPackageId) || [];
          memberList.push(cmp.SubjectId);
          packageMember.set(cmp.SubscriberPackageId, memberList);
        });
      }
      return packageMember;
    });
  }
  static getMemberFromPackage(conn, packageId) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        `SELECT CurrentPackageVersionId, MaxPackageVersionId, MinPackageVersionId, SubjectId, SubjectKeyPrefix, SubjectManageableState, SubscriberPackageId ` +
        `FROM Package2Member WHERE SubscriberPackageId = '${packageId}' AND (SubjectManageableState = 'installed' OR SubjectManageableState = 'installedEditable') ORDER BY SubjectId `;
      let queryUtil = new queryExecutor_1.default(conn);
      let result = yield queryUtil.executeQuery(query, true);
      let packageMember = [];
      if (result) {
        result.forEach((cmp) => {
          packageMember.push(cmp.SubjectId);
        });
      }
      return packageMember;
    });
  }
  static getMemberVsPackageNameMapByKeyPrefix(conn, subjectKeyPrefixList) {
    return __awaiter(this, void 0, void 0, function* () {
      let query =
        `SELECT SubjectId, SubscriberPackage.Name ` +
        `FROM Package2Member  WHERE (SubjectManageableState = 'installed' OR SubjectManageableState = 'installedEditable') AND SubjectKeyPrefix IN ('${subjectKeyPrefixList.join(
          "','"
        )}') ORDER BY SubjectId `;
      let queryUtil = new queryExecutor_1.default(conn);
      let result = yield queryUtil.executeQuery(query, true);
      let packageMember = new Map();
      if (result) {
        result.forEach((cmp) => {
          packageMember.set(cmp.SubjectId, cmp.SubscriberPackage.Name);
        });
      }
      return packageMember;
    });
  }
}
exports.default = DependencyImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW1wbC9kZXBlbmRlbmN5L2RlcGVuZGVuY3lJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQTJEO0FBQzNELDhFQUFpRDtBQUNqRCx1REFBb0Q7QUFFcEQsc0RBQW1EO0FBRW5ELE1BQXFCLGNBQWM7SUFDMUIsTUFBTSxDQUFPLG9CQUFvQixDQUN0QyxJQUFxQixFQUNyQixXQUFxQjs7WUFFckIsSUFBSSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFLENBQUMsTUFBTSxDQUN4Qyw4QkFBOEIsRUFDOUIsc0JBQXNCLEVBQ3RCLHdCQUFXLENBQUMsSUFBSSxDQUNqQixDQUFDO1lBRUYsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdEMsSUFBSSxhQUFhLEdBQTBCLElBQUksR0FBRyxFQUFvQixDQUFDO1lBQ3ZFLElBQUksb0JBQW9CLEdBQWlDLElBQUksR0FBRyxFQUc3RCxDQUFDO1lBQ0osSUFBSSxRQUFRLEdBQUcsMEJBQTBCLENBQUM7WUFFMUMsS0FBSyxJQUFJLGdCQUFnQixJQUFJLHVCQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FDMUMsSUFBSSxFQUNKLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLG9CQUFvQixDQUNyQixDQUFDO2dCQUNGLElBQUksT0FBTyxFQUFFO29CQUNYLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO29CQUN0QyxvQkFBb0IsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUM7aUJBQ3JEO2dCQUNELFdBQVcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxXQUFXLENBQUMs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
