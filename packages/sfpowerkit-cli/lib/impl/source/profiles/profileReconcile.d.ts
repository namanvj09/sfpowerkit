import MetadataFiles from "../../metadata/metadataFiles";
import ProfileActions from "./profileActions";
export default class ProfileReconcile extends ProfileActions {
  metadataFiles: MetadataFiles;
  reconcile(
    srcFolders: string[],
    profileList: string[],
    destFolder: string
  ): Promise<string[]>;
  private reconcileApp;
  private reconcileClasses;
  private reconcileFields;
  private reconcileLayouts;
  private reconcileObjects;
  private reconcileCustomMetadata;
  private reconcileCustomSettins;
  private reconcileExternalDataSource;
  private reconcileFlow;
  private reconcileCustomPermission;
  private reconcilePages;
  private reconcileRecordTypes;
  private reconcileTabs;
  private removePermissions;
}
