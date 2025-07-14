import {
    INJECT_TOKEN_KEY,
    PARAM_TYPES_KEY,
    Token
} from "../models";

export class Container {
    private static registry = new Map<Token, any>();
    private static singletons = new Map<Token, any>();

    static register<T>(token: Token<T>, target: any) {
        this.registry.set(token, target);
    }

    static resolve<T>(token: Token<T>): T {
        if (this.singletons.has(token)) {
            return this.singletons.get(token);
        }

        const target = this.registry.get(token);

        if (!target) {
            throw new Error(`No provider for token ${String(token)}`);
        }

        const paramTypes: Token[] = Reflect.getMetadata(PARAM_TYPES_KEY, target) || [];
        const injectMetadata: Record<number, Token> = Reflect.getMetadata(INJECT_TOKEN_KEY, target) || {};
        const args = paramTypes.map((param, i) => Container.resolve(injectMetadata[i] || param));

        const instance = new target(...args);

        this.singletons.set(token, instance);

        return instance;
    }
}
