export function ClassDecorator(constructor) {
    console.log(`Decorating ${constructor.name}`);
}
export function SelfDriving(constructorFunction) {
    console.log('-- decorator function invoked --');
    constructorFunction.prototype.selfDrivable = true;
}
export function EventSupport(constructorFunction) {
    //new constructor function
    let newConstructorFunction = function (...args) {
        console.log("before invoking: " + constructorFunction.name);
        let func = function () {
            return new constructorFunction(...args);
        };
        func.prototype = constructorFunction.prototype;
        let result = new func();
        console.log("after invoking: " + constructorFunction.name);
        console.log('object created: ' + JSON.stringify(result));
        result.dispatchEvent = () => { };
        result.addEventListener = () => { };
        return result;
    };
    newConstructorFunction.prototype = constructorFunction.prototype;
    return newConstructorFunction;
}
//export function EventHelper2(constructorFunction: Function) {
//    constructorFunction.prototype.addEventListener = addEventListener;
//    constructorFunction.prototype.hasEventListener = hasEventListener;
//    constructorFunction.prototype.removeEventListener = removeEventListener;
//    constructorFunction.prototype.dispatchEvent = dispatchEvent;
//}
//# sourceMappingURL=ClassDecorators.js.map