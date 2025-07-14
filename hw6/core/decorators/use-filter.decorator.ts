import {
    ExceptionFilter,
    FILTERS_METADATA
} from "../models";

export function UseFilter(...filters: Array<new () => ExceptionFilter>): MethodDecorator {
    return (target: any, key: string | symbol) => {
        if (key) {
            Reflect.defineMetadata(FILTERS_METADATA, filters, target[key]);
        } else {
            Reflect.defineMetadata(FILTERS_METADATA, filters, target);
        }
    };
}

