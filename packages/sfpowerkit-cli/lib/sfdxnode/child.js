"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_errors_1 = require("./process-errors");
const run_1 = require("./run");
const sendResolved = (value) => {
  process.send({
    type: "resolved",
    value,
  });
};
const sendRejected = (value) => {
  process.send({
    type: "rejected",
    value: process_errors_1.parseErrors(value),
  });
};
function onMessage(message) {
  process.removeListener("message", onMessage);
  if (
    message &&
    message.commandId &&
    message.commandName &&
    message.commandFile
  ) {
    const { commandId, commandName, commandFile, flags, opts } = message;
    try {
      const command = run_1.createCommand(commandId, commandName, commandFile);
      const value = command(flags, opts);
      if (value && typeof value.then === "function") {
        value.then(sendResolved).catch(sendRejected);
      } else {
        sendResolved(value);
      }
    } catch (err) {
      sendRejected(err);
    }
  }
}
process.on("message", onMessage);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2ZkeG5vZGUvY2hpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBK0M7QUFDL0MsK0JBQXNDO0FBR3RDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDWCxJQUFJLEVBQUUsVUFBVTtRQUNoQixLQUFLO0tBQ04sQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEVBQUU7SUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNYLElBQUksRUFBRSxVQUFVO1FBQ2hCLEtBQUssRUFBRSw0QkFBVyxDQUFDLEtBQUssQ0FBQztLQUMxQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixTQUFTLFNBQVMsQ0FBQyxPQUF3QjtJQUN6QyxPQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QyxJQUNFLE9BQU87UUFDUCxPQUFPLENBQUMsU0FBUztRQUNqQixPQUFPLENBQUMsV0FBVztRQUNuQixPQUFPLENBQUMsV0FBVyxFQUNuQjtRQUNBLE1BQU0sRUFDSixTQUFTLEVBQ1QsV0FBVyxFQUNYLFdBQVcsRUFDWCxLQUFLLEVBQ0wsSUFBSSxFQUNMLEdBQW9CLE9BQU8sQ0FBQztRQUM3QixJQUFJO1lBQ0YsTUFBTSxPQUFPLEdBQUcsbUJBQWEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtnQkFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDOUM7aUJBQU07Z0JBQ0wsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3JCO1NBQ0Y7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNuQjtLQUNGO0FBQ0gsQ0FBQztBQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDIn0=
