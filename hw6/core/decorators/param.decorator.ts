import {
    ArgumentMetadata,
    MINI_PARAMS,
    PARAM_TYPES_KEY,
    PipesType
} from "../models";

export function Param(data?: string, pipe?: PipesType) {
    return function (target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, metatype, type: "param", data, name, pipe });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}

export function Body(data?: string, pipe?: PipesType) {
    return function (target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, metatype, type: "body", data, name, pipe });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}

export function Query(data: string, pipe?: PipesType) {
    return function (target: any, name: string, idx: number) {
        const ps = Reflect.getMetadata(PARAM_TYPES_KEY, target, name) ?? [];
        const metatype = ps[idx];
        const params: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, target.constructor) ?? [];

        params.push({ index: idx, metatype, type: "query", data, name, pipe });
        Reflect.defineMetadata(MINI_PARAMS, params, target.constructor);
    };
}
