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
const fs = __importStar(require("fs-extra"));
const xml2js = __importStar(require("xml2js"));
const util = __importStar(require("util"));
const diffUtil_1 = __importDefault(require("./diffUtil"));
var _ = require("lodash");
const parser = new xml2js.Parser({
  explicitArray: false,
  valueProcessors: [
    function (name) {
      if (name === "true") name = true;
      if (name === "false") name = false;
      return name;
    },
  ],
});
class WorkflowDiff {
  static generateWorkflowXml(
    workflowXml1,
    workflowXml2,
    outputFilePath,
    objectName,
    destructivePackageObj,
    resultOutput,
    isDestructive
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      let workflowObj1 = {};
      let workflowObj2 = {};
      const parseString = util.promisify(parser.parseString);
      if (workflowXml1 !== "") {
        let parseResult = yield parseString(workflowXml1);
        workflowObj1 = parseResult.Workflow || {};
      }
      if (workflowXml2 !== "") {
        let parseResult = yield parseString(workflowXml2);
        workflowObj2 = parseResult.Workflow || {};
      }
      let addedEditedOrDeleted = WorkflowDiff.buildNewWorkflowObj(
        workflowObj1,
        workflowObj2
      );
      WorkflowDiff.writeWorkflow(
        addedEditedOrDeleted.addedEdited,
        outputFilePath
      );
      destructivePackageObj = WorkflowDiff.buildDestructiveChangesObj(
        addedEditedOrDeleted.deleted,
        destructivePackageObj,
        objectName
      );
      WorkflowDiff.updateOutput(
        addedEditedOrDeleted.addedEdited,
        resultOutput,
        objectName,
        "Deploy",
        outputFilePath
      );
      if (isDestructive) {
        WorkflowDiff.updateOutput(
          addedEditedOrDeleted.deleted,
          resultOutput,
          objectName,
          "Delete",
          "destructiveChanges.xml"
        );
      }
      return destructivePackageObj;
    });
  }
  static updateOutput(workflowObj, resultOutput, objectName, action, filePath) {
    workflowObj.alerts.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowAlert",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    workflowObj.fieldUpdates.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowFieldUpdate",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    workflowObj.knowledgePublishes.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowKnowledgePublish",
        componentName: `${objectName}.${elem.label}`,
        path: filePath,
      });
    });
    workflowObj.outboundMessages.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowOutboundMessage",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    workflowObj.rules.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowRule",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
    workflowObj.tasks.forEach((elem) => {
      resultOutput.push({
        action: action,
        metadataType: "WorkflowTask",
        componentName: `${objectName}.${elem.fullName}`,
        path: filePath,
      });
    });
  }
  static ensureArray(workflowObj) {
    let keys = Object.keys(workflowObj);
    keys.forEach((key) => {
      if (
        typeof workflowObj[key] === "object" &&
        !Array.isArray(workflowObj[key]) &&
        key !== "$"
      ) {
        workflowObj[key] = [workflowObj[key]];
      }
    });
    return workflowObj;
  }
  static getMembers(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let fileContent = fs.readFileSync(filePath, "utf8").toString();
      const parseString = util.promisify(parser.parseString);
      let members = {};
      if (fileContent !== "") {
        let parseResult = yield parseString(fileContent);
        let workFlowObj = parseResult.Workflow || {};
        if (!_.isNil(workFlowObj.alerts)) {
          if (!Array.isArray(workFlowObj.alerts)) {
            members["WorkflowAlert"] = [workFlowObj.alerts.fullName];
          } else {
            members["WorkflowAlert"] = workFlowObj.alerts.map(
              (workFlowAlert) => {
                return workFlowAlert.fullName;
              }
            );
          }
        }
        if (!_.isNil(workFlowObj.fieldUpdates)) {
          if (!Array.isArray(workFlowObj.fieldUpdates)) {
            members["WorkflowFieldUpdate"] = [
              workFlowObj.fieldUpdates.fullName,
            ];
          } else {
            members["WorkflowFieldUpdate"] = workFlowObj.fieldUpdates.map(
              (workFlowFU) => {
                return workFlowFU.fullName;
              }
            );
          }
        }
        if (!_.isNil(workFlowObj.knowledgePublishes)) {
          if (!Array.isArray(workFlowObj.knowledgePublishes)) {
            members["WorkflowKnowledgePublish"] = [
              workFlowObj.knowledgePublishes.label,
            ];
          } else {
            members[
              "WorkflowKnowledgePublish"
            ] = workFlowObj.knowledgePublishes.map(
              (workflowKnowledgePublish) => {
                return workflowKnowledgePublish.label;
              }
            );
          }
        }
        if (!_.isNil(workFlowObj.outboundMessages)) {
          if (!Array.isArray(workFlowObj.outboundMessages)) {
            members["WorkflowOutboundMessage"] = [
              workFlowObj.outboundMessages.fullName,
            ];
          } else {
            members[
              "WorkflowOutboundMessage"
            ] = workFlowObj.outboundMessages.map((workflowOutboundMessage) => {
              return workflowOutboundMessage.fullName;
            });
          }
        }
        if (!_.isNil(workFlowObj.rules)) {
          if (!Array.isArray(workFlowObj.rules)) {
            members["WorkflowRule"] = [workFlowObj.rules.fullName];
          } else {
            members["WorkflowRule"] = workFlowObj.rules.map((workflowRule) => {
              return workflowRule.fullName;
            });
          }
        }
        if (!_.isNil(workFlowObj.tasks)) {
          if (!Array.isArray(workFlowObj.tasks)) {
            members["WorkflowTask"] = [workFlowObj.tasks.fullName];
          } else {
            members["WorkflowTask"] = workFlowObj.tasks.map((workflowTask) => {
              return workflowTask.fullName;
            });
          }
        }
      }
      return members;
    });
  }
  static buildNewWorkflowObj(workflowObj1, workflowObj2) {
    workflowObj1 = WorkflowDiff.ensureArray(workflowObj1);
    workflowObj2 = WorkflowDiff.ensureArray(workflowObj2);
    let newWorkflowObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      alerts: [],
      fieldUpdates: [],
      knowledgePublishes: [],
      outboundMessages: [],
      rules: [],
      tasks: [],
    };
    let deletedWorkflowObj = {
      $: { xmlns: "http://soap.sforce.com/2006/04/metadata" },
      alerts: [],
      fieldUpdates: [],
      knowledgePublishes: [],
      outboundMessages: [],
      rules: [],
      tasks: [],
    };
    if (
      workflowObj1.fullName !== undefined ||
      workflowObj2.fullName !== undefined
    ) {
      newWorkflowObj.fullName = workflowObj2.fullName;
    }
    //Email alerts
    let addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.alerts,
      workflowObj2.alerts,
      "fullName"
    );
    newWorkflowObj.alerts = addedDeleted.addedEdited;
    deletedWorkflowObj.alerts = addedDeleted.deleted;
    //Field Update
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.fieldUpdates,
      workflowObj2.fieldUpdates,
      "fullName"
    );
    newWorkflowObj.fieldUpdates = addedDeleted.addedEdited;
    deletedWorkflowObj.fieldUpdates = addedDeleted.deleted;
    //Knowledge Publishes
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.knowledgePublishes,
      workflowObj2.knowledgePublishes,
      "label"
    );
    newWorkflowObj.knowledgePublishes = addedDeleted.addedEdited;
    deletedWorkflowObj.knowledgePublishes = addedDeleted.deleted;
    //Outbound Messages
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.outboundMessages,
      workflowObj2.outboundMessages,
      "fullName"
    );
    newWorkflowObj.outboundMessages = addedDeleted.addedEdited;
    deletedWorkflowObj.outboundMessages = addedDeleted.deleted;
    //Rules
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.rules,
      workflowObj2.rules,
      "fullName"
    );
    newWorkflowObj.rules = addedDeleted.addedEdited;
    deletedWorkflowObj.rules = addedDeleted.deleted;
    //Task
    addedDeleted = diffUtil_1.default.getChangedOrAdded(
      workflowObj1.tasks,
      workflowObj2.tasks,
      "fullName"
    );
    newWorkflowObj.tasks = addedDeleted.addedEdited;
    deletedWorkflowObj.tasks = addedDeleted.deleted;
    return {
      addedEdited: newWorkflowObj,
      deleted: deletedWorkflowObj,
    };
  }
  static buildDestructiveChangesObj(
    deletedWorkflows,
    destructivePackageObj,
    objectName
  ) {
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.alerts,
      "WorkflowAlert",
      objectName
    );
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.fieldUpdates,
      "WorkflowFieldUpdate",
      objectName
    );
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.knowledgePublishes,
      "WorkflowKnowledgePublish",
      objectName
    );
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.outboundMessages,
      "WorkflowOutboundMessage",
      objectName
    );
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.rules,
      "WorkflowRule",
      objectName
    );
    destructivePackageObj = WorkflowDiff.buildDestructiveType(
      destructivePackageObj,
      deletedWorkflows.tasks,
      "WorkflowTask",
      objectName
    );
    return destructivePackageObj;
  }
  static buildDestructiveType(
    destructivePackageObj,
    list,
    typeLabel,
    objectName
  ) {
    let metaType = _.find(destructivePackageObj, function (metaType) {
      return metaType.name === typeLabel;
    });
    if (metaType === undefined && list !== undefined && list.length > 0) {
      metaType = {
        name: typeLabel,
        members: [],
      };
      destructivePackageObj.push(metaType);
    }
    if (list !== undefined) {
      list.forEach((elem) => {
        metaType.members.push(objectName + "." + elem.fullName);
      });
    }
    return destructivePackageObj;
  }
  static writeWorkflow(newWorkflowObj, outputFilePath) {
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8", standalone: null },
    });
    let workflowObj = {
      Workflow: newWorkflowObj,
    };
    let xml = builder.buildObject(workflowObj);
    fs.writeFileSync(outputFilePath, xml);
  }
}
exports.default = WorkflowDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3dEaWZmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ltcGwvcHJvamVjdC9kaWZmL3dvcmtmbG93RGlmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUU3QiwwREFBa0M7QUFDbEMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTFCLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMvQixhQUFhLEVBQUUsS0FBSztJQUNwQixlQUFlLEVBQUU7UUFDZixVQUFTLElBQUk7WUFDWCxJQUFJLElBQUksS0FBSyxNQUFNO2dCQUFFLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakMsSUFBSSxJQUFJLEtBQUssT0FBTztnQkFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBcUIsWUFBWTtJQUN4QixNQUFNLENBQU8sbUJBQW1CLENBQ3JDLFlBQW9CLEVBQ3BCLFlBQW9CLEVBQ3BCLGNBQXNCLEVBQ3RCLFVBQWtCLEVBQ2xCLHFCQUE0QixFQUM1QixZQUFtQixFQUNuQixhQUFzQjs7WUFFdEIsSUFBSSxZQUFZLEdBQVEsRUFBRSxDQUFDO1lBQzNCLElBQUksWUFBWSxHQUFRLEVBQUUsQ0FBQztZQUUzQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV2RCxJQUFJLFlBQVksS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZCLElBQUksV0FBVyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNsRCxZQUFZLEdBQUcsV0FBVyxDQUFDLFFBQVEsSUFBSSxFQUFF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
