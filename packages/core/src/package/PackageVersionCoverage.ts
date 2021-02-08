import { Connection } from "jsforce";


export default class PackageVersionCoverage {

QUERY = `SELECT SubscriberPackageVersionId,Package2Id, Package2.Name,MajorVersion,MinorVersion,PatchVersion,BuildNumber, CodeCoverage, HasPassedCodeCoverageCheck, Name FROM Package2Version WHERE `;
DEFAULT_ORDER_BY_FIELDS =
  "Package2Id, MajorVersion, MinorVersion, PatchVersion, BuildNumber";

  public constructor(private conn:Connection) {
  }

  public async getCoverageWhenProvidedVersionIds(versionIds:string[]):Promise<PackageCoverage[]>
  {
    let whereClause = this.buildWhereFilter(
        "SubscriberPackageVersionId",
        versionIds
      );
    return this.getCoverageOfPackages(whereClause);

  }
  public async getCoverageWhenProvidedPackageDetails(packageName:string,versionNumber:string):Promise<PackageCoverage[]>
  {
    let whereClause =
    this.buildWhereOnNameOrId(
      "0Ho",
      "Package2Id",
      "Package2.Name",
      packageName
    ) +
    " AND " +
    this.buildVersionNumberFilter(versionNumber);

    return this.getCoverageOfPackages(whereClause);

  }


  public async getCoverageOfPackages(
    whereClause:string
  ): Promise<PackageCoverage[]> {

    let output = [];

    const result = (await this.conn.tooling.query(
      `${this.QUERY} ${whereClause} ORDER BY ${this.DEFAULT_ORDER_BY_FIELDS}`
    )) as any;
    if (result && result.size > 0) {
      result.records.forEach((record) => {
        var packageCoverage = <PackageCoverage>{};
        packageCoverage.HasPassedCodeCoverageCheck =
          record.HasPassedCodeCoverageCheck;
        packageCoverage.coverage = record.CodeCoverage
          ? record.CodeCoverage.apexCodeCoveragePercentage
          : 0;
        packageCoverage.packageId = record.Package2Id;
        packageCoverage.packageName = record.Package2.Name;
        packageCoverage.packageVersionId = record.SubscriberPackageVersionId;
        packageCoverage.packageVersionNumber = `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}.${record.BuildNumber}`;
        output.push(packageCoverage);
      });
    } else {
      throw new Error(
        `Package version doesnot exist, Please check the version details`
      );
    }
    return output;
  }



  // buid the where clause IN or = based on length
  private buildWhereFilter(key: string, value: string[]) {
    var result = "";
    if (value.length > 1) {
      result = `${key} IN ('${value.join("','")}')`;
    } else {
      result = `${key}  = '${value[0]}'`;
    }
    return result;
  }
  //build where clause based of id or name
  private buildWhereOnNameOrId(
    idFilter: string,
    idKey: string,
    nameKey: string,
    value: string
  ) {
    var result = "";
    if (value.startsWith(idFilter)) {
      result = `${idKey} = '${value}' `;
    } else {
      result = `${nameKey} = '${value}' `;
    }
    return result;
  }


  private buildVersionNumberFilter(versionNumber: string) {
    var result = "";
    let versionNumberList = versionNumber.split(".");
    if (versionNumberList.length === 4) {
      result = `MajorVersion = ${versionNumberList[0]} AND MinorVersion = ${versionNumberList[1]} AND PatchVersion = ${versionNumberList[2]} AND BuildNumber = ${versionNumberList[3]}`;
    } else {
      throw new Error(
        "Provide complete version number format in major.minor.patch (Beta build)—for example, 1.2.0.5"
      );
    }
    return result;
  }
}
export interface PackageCoverage {
  coverage: number;
  packageName: string;
  packageId: string;
  packageVersionNumber: string;
  packageVersionId: string;
  HasPassedCodeCoverageCheck: Boolean;
}
