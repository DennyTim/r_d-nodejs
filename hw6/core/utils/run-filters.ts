import {
    Request,
    Response
} from "express";
import { HttpException } from "../exceptions/http.exception";
import {
    FILTERS_METADATA,
    Type
} from "../models";
import { Container } from "./container";

const getFilters = (
    handler: Function | null,
    controllerClass: Function | null,
    global: Array<Type> = []
): Type[] => {
    const controllerFilters = controllerClass
        ? Reflect.getMetadata(FILTERS_METADATA, controllerClass) ?? []
        : [];

    const methodFilters = handler
        ? Reflect.getMetadata(FILTERS_METADATA, handler) ?? []
        : [];

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

        if (res.headersSent) {
            return;
        }
    }

    if (error instanceof HttpException) {
        return res.status(error.status).json({ message: error.message });
    }

    if (!res.headersSent) {
        res.status(500).json({ message: "Unhandled exception" });
    }
}
