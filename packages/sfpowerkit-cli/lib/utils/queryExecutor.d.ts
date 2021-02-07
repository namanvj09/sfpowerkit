import { core } from "@salesforce/command";
export default class QueryExecutor {
  private conn;
  constructor(conn: core.Connection);
  executeQuery(query: string, tooling: boolean): Promise<any>;
  queryMore(url: string, tooling: boolean): Promise<any>;
}
