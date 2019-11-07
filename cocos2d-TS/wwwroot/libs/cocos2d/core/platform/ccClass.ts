import { nonenumerable } from "../../../decorators/PropertyDecorator";



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

    private ___pid: number = 0;

    @nonenumerable
    public get __pid(): number {
        return this.___pid;
    }

    public set __pid(value: number) {
        this.___pid = value;
    }


    constructor() {
        this.__instanceId = classManager.getNewInstanceId();
        this.___pid = classManager.getNewID();

    }
}