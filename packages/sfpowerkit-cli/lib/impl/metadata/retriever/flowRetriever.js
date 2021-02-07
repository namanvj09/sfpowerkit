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
const metadataInfo_1 = require("../metadataInfo");
const baseMetadataRetriever_1 = __importDefault(
  require("./baseMetadataRetriever")
);
const metadataFiles_1 = __importDefault(require("../metadataFiles"));
const QUERY = "SELECT Id, MasterLabel, FullName  From Flow";
class FlowRetriever extends baseMetadataRetriever_1.default {
  constructor(org) {
    super(org, true);
    this.org = org;
    super.setQuery(QUERY);
  }
  static getInstance(org) {
    if (!FlowRetriever.instance) {
      FlowRetriever.instance = new FlowRetriever(org);
    }
    return FlowRetriever.instance;
  }
  getObjects() {
    return __awaiter(this, void 0, void 0, function* () {
      if (
        (this.data === undefined || this.data.length == 0) &&
        !this.dataLoaded
      ) {
        let flows = yield this.retrieveFlows();
        this.data = flows;
        this.dataLoaded = true;
      }
      return this.data;
    });
  }
  retrieveFlows() {
    return __awaiter(this, void 0, void 0, function* () {
      const apiversion = yield this.org.retrieveMaxApiVersion();
      let toReturn = new Promise((resolve, reject) => {
        this.org
          .getConnection()
          .metadata.list(
            [{ type: "Flow", folder: null }],
            apiversion,
            function (err, metadata) {
              if (err) {
                return reject(err);
              }
              let flowsObjList = [];
              if (metadata != undefined && metadata.length > 0) {
                for (let i = 0; i < metadata.length; i++) {
                  let flow = {
                    FullName: metadata[i].fullName,
                    NamespacePrefix: metadata[i].namespacePrefix,
                    Id: "",
                  };
                  if (
                    metadata[i].namespacePrefix !== "" &&
                    metadata[i].namespacePrefix !== undefined
                  ) {
                    flow.FullName = `${metadata[i].namespacePrefix}__${metadata[i].fullName}`;
                  }
                  flowsObjList.push(flow);
                }
              }
              resolve(flowsObjList);
            }
          );
      });
      return toReturn;
    });
  }
  getFlows() {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.getObjects();
    });
  }
  flowExists(flowStr) {
    return __awaiter(this, void 0, void 0, function* () {
      let found = false;
      //Look first in project files
      if (!_.isNil(metadataInfo_1.METADATA_INFO.Flow.components)) {
        found = metadataInfo_1.METADATA_INFO.Flow.components.includes(flowStr);
      }
      if (!found && !metadataFiles_1.default.sourceOnly) {
        //not found, check on the org
        let flows = yield this.getFlows();
        let foundFlow = flows.find((flow) => {
          return flow.FullName === flowStr;
        });
        found = !_.isNil(foundFlow);
      }
      return found;
    });
  }
}
exports.default = FlowRetriever;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd1JldHJpZXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3JldHJpZXZlci9mbG93UmV0cmlldmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDBDQUE0QjtBQUM1QixrREFBZ0Q7QUFDaEQsb0ZBQTREO0FBQzVELHFFQUE2QztBQUc3QyxNQUFNLEtBQUssR0FBRyw2Q0FBNkMsQ0FBQztBQUM1RCxNQUFxQixhQUFjLFNBQVEsK0JBQTJCO0lBRXBFLFlBQTJCLEdBQVE7UUFDakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQURRLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFRO1FBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFO1lBQzNCLGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDakQ7UUFDRCxPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUM7SUFDaEMsQ0FBQztJQUVZLFVBQVU7O1lBQ3JCLElBQ0UsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ2xELENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDaEI7Z0JBQ0EsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzthQUN4QjtZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFFSyxhQUFhOztZQUNqQixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMxRCxJQUFJLFFBQVEsR0FBb0IsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxHQUFHO3FCQUNMLGFBQWEsRUFBRTtxQkFDZixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUMzRCxHQUFHLEVBQ0gsUUFBUTtvQkFFUixJQUFJLEdBQUcsRUFBRTt3QkFDUCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDcEI7b0JBQ0QsSUFBSSxZQUFZLEdBQVcsRUFBRSxDQUFDO29CQUM5QixJQUFJLFFBQVEsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUN4QyxJQUFJLElBQUksR0FBUztnQ0FDZixRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0NBQzlCLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtnQ0FDNUMsRUFBRSxFQUFFLEVBQUU7NkJBQ1AsQ0FBQzs0QkFDRixJQUNFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEtBQUssRUFBRTtnQ0FDbEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQ3pDO2dDQUNBLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs2QkFDM0U7NEJBQ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDekI7cUJBQ0Y7b0JBQ0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRVksUUFBUTs7WUFDbkIsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQUE7SUFFWSxVQUFVLENBQUMsT0FBZTs7WUFDckMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLDZCQUE2QjtZQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw0QkFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDM0MsS0FBSyxHQUFHLDRCQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDekQ7WUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsdUJBQWEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLDZCQUE2QjtnQkFDN0IsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQztnQkFDbkMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3QjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0NBQ0Y7QUFsRkQsZ0NBa0ZDIn0=
