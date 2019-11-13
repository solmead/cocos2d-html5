

export function ClassDecorator(constructor: (...args: any[]) => any) {
    console.log(`Decorating ${constructor.name}`);
}
export function SelfDriving(constructorFunction: Function) {
    console.log('-- decorator function invoked --');
    constructorFunction.prototype.selfDrivable = true;
}

export function EventSupport<T extends { new(...constructorArgs: Array<any>):void }>(constructorFunction: T) {
    //new constructor function
    let newConstructorFunction: any = function (...args: Array<any>) {
        console.log("before invoking: " + constructorFunction.name);
        let func: any = function () {
            return new constructorFunction(...args);
        }
        func.prototype = constructorFunction.prototype;
        let result: any = new func();
        console.log("after invoking: " + constructorFunction.name);
        console.log('object created: ' + JSON.stringify(result));

        result.dispatchEvent = () => { }
        result.addEventListener = () => { }

        return result;
    }
    newConstructorFunction.prototype = constructorFunction.prototype;
    return newConstructorFunction;



}

//export function EventHelper2(constructorFunction: Function) {

//    constructorFunction.prototype.addEventListener = addEventListener;
//    constructorFunction.prototype.hasEventListener = hasEventListener;
//    constructorFunction.prototype.removeEventListener = removeEventListener;
//    constructorFunction.prototype.dispatchEvent = dispatchEvent;



//}

