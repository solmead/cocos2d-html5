export function PropertyDecorator(target, propertyKey) {
    console.log(`Decorating property ${propertyKey}` +
        ` from ${target.constructor.name}`);
}
export function configurable(value) {
    return function (target, propertyKey, descriptor) {
        descriptor.configurable = value;
    };
}
export function enumerable(value) {
    return function (target, propertyKey, descriptor) {
        descriptor.enumerable = value;
    };
}
export const nonenumerable = (target, propertyKey) => {
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    if (descriptor.enumerable !== false) {
        descriptor.enumerable = false;
        Object.defineProperty(target, propertyKey, descriptor);
    }
};
//# sourceMappingURL=PropertyDecorator.js.map