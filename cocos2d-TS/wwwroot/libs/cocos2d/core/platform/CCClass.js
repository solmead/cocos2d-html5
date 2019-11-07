var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { nonenumerable } from "../../../decorators/PropertyDecorator";
/**
 * @namespace
 * @name ClassManager
 */
class ClassManager {
    constructor() {
        this.id = (0 | (Math.random() * 998));
        this.instanceId = (0 | (Math.random() * 998));
    }
    getNewID() {
        return this.id++;
    }
    getNewInstanceId() {
        return this.instanceId++;
    }
}
var classManager = new ClassManager();
export class ccClass {
    constructor() {
        this.___pid = 0;
        this.__instanceId = classManager.getNewInstanceId();
        this.___pid = classManager.getNewID();
    }
    get __pid() {
        return this.___pid;
    }
    set __pid(value) {
        this.___pid = value;
    }
}
__decorate([
    nonenumerable
], ccClass.prototype, "__pid", null);
//# sourceMappingURL=ccClass.js.map