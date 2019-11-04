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
        this.__instanceId = classManager.getNewInstanceId();
    }
}
//# sourceMappingURL=ccClass.js.map