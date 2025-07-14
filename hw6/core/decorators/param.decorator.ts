import {
    ArgumentMetadata,
    MINI_PARAMS,
    PARAM_TYPES_KEY
} from "../models";

export function Param(data?: string) {
    return function(target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, metatype, type: "param", data, name });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}

export function Body() {
    return function(target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, type: "body", metatype, name });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}

export function Query(data: string) {
    return function(target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, type: "query", metatype, data, name });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}
