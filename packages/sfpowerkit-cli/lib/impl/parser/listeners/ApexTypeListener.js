"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApexTypeListener {
  constructor() {
    this.apexType = {
      class: false,
      testClass: false,
      interface: false,
    };
  }
  enterAnnotation(ctx) {
    if (ctx._stop.text.toUpperCase() === "ISTEST") {
      this.apexType["testClass"] = true;
    }
  }
  enterInterfaceDeclaration(ctx) {
    this.apexType["interface"] = true;
  }
  enterClassDeclaration(ctx) {
    this.apexType["class"] = true;
  }
  getApexType() {
    return this.apexType;
  }
}
exports.default = ApexTypeListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBleFR5cGVMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbXBsL3BhcnNlci9saXN0ZW5lcnMvQXBleFR5cGVMaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLE1BQXFCLGdCQUFnQjtJQUFyQztRQUNVLGFBQVEsR0FBYTtZQUMzQixLQUFLLEVBQUUsS0FBSztZQUNaLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUM7SUFtQkosQ0FBQztJQWpCVyxlQUFlLENBQUMsR0FBc0I7UUFDOUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLEVBQUU7WUFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRU8seUJBQXlCLENBQUMsR0FBZ0M7UUFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDcEMsQ0FBQztJQUVPLHFCQUFxQixDQUFDLEdBQTRCO1FBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFTSxXQUFXO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0NBQ0Y7QUF4QkQsbUNBd0JDIn0=
