

export function PropertyDecorator(
    target: any,
    propertyKey: string | symbol,
) {
    console.log(
        `Decorating property ${<string>propertyKey}` +
        ` from ${target.constructor.name}`,
    );
}


export function configurable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.configurable = value;
    };
}
export function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}
export const nonenumerable = (target: any, propertyKey: string) => {
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    if (descriptor.enumerable !== false) {
        descriptor.enumerable = false;
        Object.defineProperty(target, propertyKey, descriptor)
    }
}