import MetadataFiles from "../../metadata/metadataFiles";
import ProfileActions from "./profileActions";
export default class ProfileSync extends ProfileActions {
  metadataFiles: MetadataFiles;
  sync(
    srcFolders: string[],
    profiles?: string[],
    isdelete?: boolean
  ): Promise<{
    added: string[];
    deleted: string[];
    updated: string[];
  }>;
}
