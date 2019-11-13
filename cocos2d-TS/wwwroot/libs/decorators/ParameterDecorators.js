export function ParameterDecorator(target, propertyKey, parameterIndex) {
    console.log(`Decorating parameter ${propertyKey}` + ` (index ${parameterIndex})` +
        ` from ${target.constructor.name}`);
}
//# sourceMappingURL=ParameterDecorators.js.map