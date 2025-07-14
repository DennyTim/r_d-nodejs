import {
    Request,
    Response
} from "express";
import {
    FILTERS_METADATA,
    Type
} from "../models";
import { Container } from "./container";

const getFilters = (
    handler: Function,
    controllerClass: Function,
    global: Array<Type> = []
): Type[] => {
    const controllerFilters = Reflect.getMetadata(FILTERS_METADATA, controllerClass) ?? [];
    const methodFilters = Reflect.getMetadata(FILTERS_METADATA, handler) ?? [];

    return [...global, ...controllerFilters, ...methodFilters];
};

export async function runFilters(
    controllerClass: Function,
    handler: Function,
    req: Request,
    res: Response,
    error: any,
    global: Array<Type> = []
) {
    const filters = getFilters(handler, controllerClass, global);

    for (const filter of filters) {
        const instance = Container.resolve(filter);
        await instance.catch?.(error, { req, res });
    }
}
