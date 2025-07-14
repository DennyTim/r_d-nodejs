import {
    Interceptor,
    INTERCEPTORS_METADATA
} from "../models";

export function UseInterceptor(...interceptors: Array<new () => Interceptor>): MethodDecorator {
    return (target: any, key: string | symbol) => {
        if (key) {
            Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, target[key]);
        } else {
            Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, target);
        }
    };
}

