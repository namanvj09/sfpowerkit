import { Connection, DeployResult } from "jsforce";
export declare function checkDeploymentStatus(
  conn: Connection,
  retrievedId: string
): Promise<DeployResult>;
