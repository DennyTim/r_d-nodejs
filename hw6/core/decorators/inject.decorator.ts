import {
    INJECT_TOKEN_KEY,
    Token
} from "../models";

export const Inject = (token: Token): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
        const existing = Reflect.getMetadata(INJECT_TOKEN_KEY, target) || {};
        existing[parameterIndex] = token;
        Reflect.defineMetadata(INJECT_TOKEN_KEY, existing, target);
    };
};
