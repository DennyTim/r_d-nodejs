import {
    Request,
    Response
} from "express";
import {
    INTERCEPTORS_METADATA,
    Type
} from "../models";
import { Container } from "./container";

const getInterceptors = (
    handler: Function,
    controllerClass: Function,
    global: Array<Type> = []
): Type[] => {
    const controllerInterceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, controllerClass) ?? [];
    const methodInterceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, handler) ?? [];

    return [...global, ...controllerInterceptors, ...methodInterceptors];
};

export async function runInterceptors(
    controllerClass: Function,
    handler: Function,
    req: Request,
    res: Response,
    handlerFn: () => any,
    global: Array<Type> = []
): Promise<any> {
    const interceptors = getInterceptors(handler, controllerClass, global)
        .map((item) => Container.resolve(item));

    let next = handlerFn;

    for (const interceptor of interceptors.reverse()) {
        const current = next;
        next = () => interceptor.intercept({ req, res }, current);
    }

    return next();
}
