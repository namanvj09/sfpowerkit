import { Connection } from "@salesforce/core";
export default class Passwordgenerateimpl {
  static run(
    conn: Connection
  ): Promise<{
    username: string;
    password: string;
  }>;
  static generatePassword(): string;
}
