"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = void 0;
function chunkArray(perChunk, inputArray) {
  let chunks = [],
    i = 0,
    n = inputArray.length;
  while (i < n) {
    chunks.push(inputArray.slice(i, (i += perChunk)));
  }
  return chunks;
}
exports.chunkArray = chunkArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2h1bmtBcnJheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9jaHVua0FycmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLFNBQWdCLFVBQVUsQ0FBQyxRQUFnQixFQUFFLFVBQWlCO0lBQzVELElBQUksTUFBTSxHQUFHLEVBQUUsRUFDYixDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBRXhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQVZELGdDQVVDIn0=
