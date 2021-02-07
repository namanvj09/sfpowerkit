"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseErrors = void 0;
const parseErrors = (sfdxErrors) =>
  Array.isArray(sfdxErrors)
    ? sfdxErrors.map(parseError)
    : [parseError(sfdxErrors)];
exports.parseErrors = parseErrors;
function parseError(error) {
  function hasOwnProperty(value) {
    return (error || {}).hasOwnProperty && (error || {}).hasOwnProperty(value);
  }
  if (hasOwnProperty("error")) {
    return parseError(error.error);
  } else if (error instanceof Error) {
    return parseNativeError(error);
  } else if (hasOwnProperty("message")) {
    return error;
  } else if (typeof error === "string") {
    return { message: error };
  }
  const str = String(error);
  return {
    message: str !== "[object Object]" ? str : JSON.stringify(error),
  };
}
const parseNativeError = (error) => {
  return Object.getOwnPropertyNames(error).reduce(
    (result, key) => {
      if (key !== "__proto__" && typeof error[key] !== "function") {
        result[key] = error[key];
      }
      return result;
    },
    {
      message: "",
    }
  );
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1lcnJvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2ZkeG5vZGUvcHJvY2Vzcy1lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRU8sTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFlLEVBQUUsRUFBRSxDQUM3QyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUN2QixDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFIbEIsUUFBQSxXQUFXLGVBR087QUFFL0IsU0FBUyxVQUFVLENBQUMsS0FBVTtJQUM1QixTQUFTLGNBQWMsQ0FBQyxLQUFhO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsY0FBYyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO1NBQU0sSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO1FBQ2pDLE9BQU8sZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7U0FBTSxJQUFJLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUNwQyxPQUFPLEtBQUssQ0FBQztLQUNkO1NBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDcEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUMzQjtJQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixPQUFPO1FBQ0wsT0FBTyxFQUFFLEdBQUcsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztLQUNqRSxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFZLEVBQWlCLEVBQUU7SUFDdkQsT0FBTyxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUM3QyxDQUFDLE1BQXFCLEVBQUUsR0FBVyxFQUFFLEVBQUU7UUFDckMsSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFVBQVUsRUFBRTtZQUMzRCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyxFQUNEO1FBQ0UsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUNGLENBQUM7QUFDSixDQUFDLENBQUMifQ==
