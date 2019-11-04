

/**
 * @namespace
 * @name ClassManager
 */
class ClassManager {
    private id: number = (0 | (Math.random() * 998));
    private instanceId: number = (0 | (Math.random() * 998));
    constructor() {

    }

    getNewID(): number {
        return this.id++;
    }

    getNewInstanceId(): number {
        return this.instanceId++;
    }
}

var classManager = new ClassManager();


export class ccClass {
    public __instanceId: number;


    constructor() {
        this.__instanceId = classManager.getNewInstanceId();

    }
}