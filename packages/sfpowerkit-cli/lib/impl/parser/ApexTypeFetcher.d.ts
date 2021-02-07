export default class ApexTypeFetcher {
  /**
   * Get Apex type of cls files in a search directory.
   * Sorts files into classes, test classes and interfaces.
   * @param searchDir
   */
  getApexTypeOfClsFiles(searchDir: string): ApexSortedByType;
}
export interface ApexSortedByType {
  class: FileDescriptor[];
  testClass: FileDescriptor[];
  interface: FileDescriptor[];
  parseError: FileDescriptor[];
}
interface FileDescriptor {
  name: string;
  filepath: string;
  error?: any;
}
export {};
