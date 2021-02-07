import { Connection } from "@salesforce/core";
import { DescribeSObjectResult } from "jsforce/describe-result";
import { ProfileObjectPermissions, ProfileUserPermission } from "../schema";
export default class UserPermissionBuilder {
  static supportedPermissions: string[];
  static addPermissionDependencies(profileOrPermissionSet: any): void;
  private static mergeObjectAccess;
  private static addAccess;
  private static addRequiredObjectAccess;
  static describeSObject(
    conn: Connection,
    sObjectName: string
  ): Promise<DescribeSObjectResult>;
  static getSupportedPermissions(conn: Connection): Promise<string[]>;
  static isSupportedPermission(permission: string): Promise<boolean>;
  static handlePermissionDependency(
    profileOrPermissionSet: {
      objectPermissions?: ProfileObjectPermissions[];
      userPermissions?: ProfileUserPermission[];
    },
    supportedPermissions: string[]
  ): any;
  static enablePermission(
    profileObj: {
      objectPermissions?: ProfileObjectPermissions[];
      userPermissions?: ProfileUserPermission[];
    },
    permissionName: string,
    supportedPermission: string[]
  ): void;
  static hasPermission(
    profileOrPermissionSet: {
      objectPermissions?: ProfileObjectPermissions[];
      userPermissions?: ProfileUserPermission[];
    },
    permissionName: string
  ): boolean;
}
