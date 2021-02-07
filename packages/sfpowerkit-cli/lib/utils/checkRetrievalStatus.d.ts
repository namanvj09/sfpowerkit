import { Connection } from "jsforce";
export declare function checkRetrievalStatus(
  conn: Connection,
  retrievedId: string,
  isToBeLoggedToConsole?: boolean
): Promise<any>;
