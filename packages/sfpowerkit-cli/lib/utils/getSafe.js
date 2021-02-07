"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafe = void 0;
function getSafe(fn, defaultVal) {
  try {
    return fn();
  } catch (e) {
    this.console.log("test" + e);
    return defaultVal;
  }
}
exports.getSafe = getSafe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2FmZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZXRTYWZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLFNBQWdCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsVUFBVTtJQUNwQyxJQUFJO1FBQ0YsT0FBTyxFQUFFLEVBQUUsQ0FBQztLQUNiO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0IsT0FBTyxVQUFVLENBQUM7S0FDbkI7QUFDSCxDQUFDO0FBUEQsMEJBT0MifQ==
