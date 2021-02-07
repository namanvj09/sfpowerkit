import { AnyJson } from "@salesforce/ts-types";
export default class XmlUtil {
  static xmlToJSON(directory: string): Promise<any>;
  static jSONToXML(obj: AnyJson): any;
}
