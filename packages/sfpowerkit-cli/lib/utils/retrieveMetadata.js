"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveMetadata = void 0;
function retrieveMetadata(types, connection) {
  return __awaiter(this, void 0, void 0, function* () {
    const apiversion = yield connection.retrieveMaxApiVersion();
    let toReturn = new Promise((resolve, reject) => {
      connection.metadata.list(types, apiversion, function (err, metadata) {
        if (err) {
          return reject(err);
        }
        let metadata_fullnames = [];
        for (let i = 0; i < metadata.length; i++) {
          metadata_fullnames.push(metadata[i].fullName);
        }
        resolve(metadata_fullnames);
      });
    });
    return toReturn;
  });
}
exports.retrieveMetadata = retrieveMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0cmlldmVNZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9yZXRyaWV2ZU1ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLFNBQXNCLGdCQUFnQixDQUNwQyxLQUFVLEVBQ1YsVUFBc0I7O1FBRXRCLE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDNUQsSUFBSSxRQUFRLEdBQXNCLElBQUksT0FBTyxDQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBUyxHQUFHLEVBQUUsUUFBUTtnQkFDaEUsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3BCO2dCQUNELElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDL0M7Z0JBQ0QsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQW5CRCw0Q0FtQkMifQ==
