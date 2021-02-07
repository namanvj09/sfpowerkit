import { core } from "@salesforce/command";
import { MetadataSummary } from "../metadata/retriever/metadataSummaryInfoFetcher";
export default class DependencyImpl {
  static getDependencyMapById(
    conn: core.Connection,
    refMetadata: string[]
  ): Promise<{
    dependencyMap: Map<string, string[]>;
    dependencyDetailsMap: Map<string, MetadataSummary>;
  }>;
  static getDependencyMapByType(
    conn: core.Connection,
    refMetadata: string[]
  ): Promise<{
    dependencyMap: Map<string, string[]>;
    dependencyDetailsMap: Map<string, MetadataSummary>;
  }>;
  private static fetchDependencies;
  static getMemberVsPackageMap(
    conn: core.Connection
  ): Promise<Map<string, string>>;
  static getPackageVsMemberMap(
    conn: core.Connection
  ): Promise<Map<string, string[]>>;
  static getMemberFromPackage(
    conn: core.Connection,
    packageId: string
  ): Promise<string[]>;
  static getMemberVsPackageNameMapByKeyPrefix(
    conn: core.Connection,
    subjectKeyPrefixList: String[]
  ): Promise<Map<string, string>>;
}
