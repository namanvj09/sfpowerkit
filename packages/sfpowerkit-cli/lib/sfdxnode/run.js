"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = void 0;
const buildArgs_1 = require("./buildArgs");
const hookStd = require("hook-std");
const process_errors_1 = require("./process-errors");
const realStdoutWrite = process.stdout.write;
const realStderrWrite = process.stderr.write;
let sfdxErrors = [];
// @ts-ignore
process.on("cmdError", (errObj) => {
  sfdxErrors.push(errObj);
});
const unhookStd = () => {
  process.stdout.write = realStdoutWrite;
  process.stderr.write = realStderrWrite;
};
const createCommand = (commandId, commandName, commandFile) => (
  flags = {},
  opts = []
) =>
  new Promise((resolve, reject) => {
    // tslint:disable-next-line:non-literal-require
    const required = require(commandFile);
    const command = required.default || required[commandName];
    command.id = commandId;
    const args = buildArgs_1.buildArgs(flags, opts);
    const quiet = Boolean(flags.quiet) || false;
    let currentHookFlag = false;
    if (quiet) {
      hookStd(() => undefined);
      currentHookFlag = true;
    }
    sfdxErrors = [];
    command
      .run(args)
      .then((sfdxResult) => {
        if (quiet && currentHookFlag) {
          currentHookFlag = false;
          unhookStd();
        }
        if (sfdxErrors.length) {
          throw sfdxErrors;
        }
        if (process.exitCode) {
          process.exitCode = 0;
        }
        resolve(sfdxResult);
      })
      .catch((sfdxErr) => {
        if (quiet && currentHookFlag) {
          currentHookFlag = false;
          unhookStd();
        }
        if (process.exitCode) {
          process.exitCode = 0;
        }
        reject(process_errors_1.parseErrors(sfdxErr));
      });
  });
exports.createCommand = createCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NmZHhub2RlL3J1bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBd0M7QUFDeEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLHFEQUErQztBQUcvQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFFcEIsYUFBYTtBQUNiLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFFO0lBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7SUFDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQztBQUN6QyxDQUFDLENBQUM7QUFFSyxNQUFNLGFBQWEsR0FBc0IsQ0FDOUMsU0FBaUIsRUFDakIsV0FBbUIsRUFDbkIsV0FBbUIsRUFDbkIsRUFBRSxDQUFDLENBQUMsUUFBZSxFQUFFLEVBQUUsT0FBYSxFQUFFLEVBQUUsRUFBRSxDQUMxQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUM5QiwrQ0FBK0M7SUFDL0MsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFELE9BQU8sQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQ3ZCLE1BQU0sSUFBSSxHQUFhLHFCQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLE1BQU0sS0FBSyxHQUFZLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDO0lBRXJELElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztJQUM1QixJQUFJLEtBQUssRUFBRTtRQUNULE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QixlQUFlLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0lBQ0QsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNoQixPQUFPO1NBQ0osR0FBRyxDQUFDLElBQUksQ0FBQztTQUNULElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNqQixJQUFJLEtBQUssSUFBSSxlQUFlLEVBQUU7WUFDNUIsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUN4QixTQUFTLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sVUFBVSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNmLElBQUksS0FBSyxJQUFJLGVBQWUsRUFBRTtZQUM1QixlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLFNBQVMsRUFBRSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDcEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDdEI7UUFDRCxNQUFNLENBQUMsNEJBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUE1Q1EsUUFBQSxhQUFhLGlCQTRDckIifQ==
