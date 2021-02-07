import { ApexParserListener, AnnotationContext } from "apex-parser";
export default class ApexTypeListener implements ApexParserListener {
  private apexType;
  protected enterAnnotation(ctx: AnnotationContext): void;
  private enterInterfaceDeclaration;
  private enterClassDeclaration;
  getApexType(): ApexType;
}
interface ApexType {
  class: boolean;
  testClass: boolean;
  interface: boolean;
}
export {};
