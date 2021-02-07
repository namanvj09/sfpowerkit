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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const xml2js = __importStar(require("xml2js"));
const format = require("xml-formatter");
const nonArayProperties = [
  "custom",
  "description",
  "fullName",
  "userLicense",
  "$",
];
const PROFILE_NAMESPACE = "http://soap.sforce.com/2006/04/metadata";
class ProfileWriter {
  writeProfile(profileObj, filePath) {
    //Delete eampty arrays
    for (let key in profileObj) {
      if (Array.isArray(profileObj[key])) {
        //All top element must be arays exept non arrayProperties
        if (!nonArayProperties.includes(key) && profileObj[key].length === 0) {
          delete profileObj[key];
        }
      }
    }
    let builder = new xml2js.Builder({
      rootName: "Profile",
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });
    profileObj["$"] = {
      xmlns: PROFILE_NAMESPACE,
    };
    let xml = builder.buildObject(profileObj);
    let formattedXml = format(xml, {
      indentation: "    ",
      filter: (node) => node.type !== "Comment",
      collapseContent: true,
      lineSeparator: "\n",
    });
    //console.log(formattedXml);
    fs.writeFileSync(filePath, formattedXml);
  }
  toXml(profileObj) {
    //Delete eampty arrays
    for (let key in profileObj) {
      if (Array.isArray(profileObj[key])) {
        //All top element must be arays exept non arrayProperties
        if (!nonArayProperties.includes(key) && profileObj[key].length === 0) {
          delete profileObj[key];
        }
      }
    }
    let builder = new xml2js.Builder({
      rootName: "Profile",
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });
    profileObj["$"] = {
      xmlns: PROFILE_NAMESPACE,
    };
    let xml = builder.buildObject(profileObj);
    let formattedXml = format(xml, {
      indentation: "    ",
      filter: (node) => node.type !== "Comment",
      collapseContent: true,
      lineSeparator: "\n",
    });
    return formattedXml;
  }
  toProfile(profileObj) {
    var convertedObject = {};
    for (var key in profileObj) {
      if (Array.isArray(profileObj[key])) {
        //All top element must be arays exept non arrayProperties
        if (nonArayProperties.includes(key)) {
          convertedObject[key] =
            profileObj[key][0] === "true"
              ? true
              : profileObj[key][0] === "false"
              ? false
              : profileObj[key][0];
        } else {
          var data = [];
          for (var i = 0; i < profileObj[key].length; i++) {
            var element = this.removeArrayNatureOnValue(profileObj[key][i]);
            if (element !== "") {
              data.push(element);
            }
          }
          convertedObject[key] = data;
        }
      } else if (nonArayProperties.includes(key)) {
        convertedObject[key] = profileObj[key];
      }
    }
    return convertedObject;
  }
  removeArrayNatureOnValue(obj) {
    var toReturn = {};
    for (var key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        //All top element must be arays exept non arrayProperties
        toReturn[key] =
          obj[key][0] === "true"
            ? true
            : obj[key][0] === "false"
            ? false
            : obj[key][0];
      } else {
        toReturn[key] = obj[key];
      }
    }
    return toReturn;
  }
}
exports.default = ProfileWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZVdyaXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL21ldGFkYXRhL3dyaXRlci9wcm9maWxlV3JpdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDZDQUErQjtBQUMvQiwrQ0FBaUM7QUFDakMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRXhDLE1BQU0saUJBQWlCLEdBQUc7SUFDeEIsUUFBUTtJQUNSLGFBQWE7SUFDYixVQUFVO0lBQ1YsYUFBYTtJQUNiLEdBQUc7Q0FDSixDQUFDO0FBQ0YsTUFBTSxpQkFBaUIsR0FBRyx5Q0FBeUMsQ0FBQztBQUVwRSxNQUFxQixhQUFhO0lBQ3pCLFlBQVksQ0FBQyxVQUFtQixFQUFFLFFBQWdCO1FBQ3ZELHNCQUFzQjtRQUN0QixLQUFLLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTtZQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xDLHlEQUF5RDtnQkFDekQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDcEUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3hCO2FBQ0Y7U0FDRjtRQUVELElBQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUMvQixRQUFRLEVBQUUsU0FBUztZQUNuQixNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7U0FDOUMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ2hCLEtBQUssRUFBRSxpQkFBaUI7U0FDekIsQ0FBQztRQUNGLElBQUks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
