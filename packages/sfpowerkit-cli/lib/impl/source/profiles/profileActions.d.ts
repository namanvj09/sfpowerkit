import { Connection, Org } from "@salesforce/core";
import ProfileRetriever from "../../metadata/retriever/profileRetriever";
export default abstract class ProfileActions {
  org: Org;
  protected conn: Connection;
  protected debugFlag: boolean;
  protected profileRetriever: ProfileRetriever;
  constructor(org: Org, debugFlag?: boolean);
  protected getProfileFullNamesWithLocalStatus(
    profileNames: string[]
  ): Promise<{
    added: string[];
    deleted: string[];
    updated: string[];
  }>;
}
