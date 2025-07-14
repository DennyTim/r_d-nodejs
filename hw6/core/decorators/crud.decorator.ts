import {
    Method,
    ROUTES_METADATA
} from "../models";

export function Route(method: Method, path = "") {
    return function(target: any, key: string) {
        const routes = Reflect.getMetadata(ROUTES_METADATA, target.constructor) ?? [];
        routes.push({ method, path, handlerName: key });
        Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
    };
}

export const Get = (p = "") => Route("get", p);
export const Post = (p = "") => Route("post", p);
export const Patch = (p = "") => Route("patch", p);
export const Put = (p = "") => Route("put", p);
export const Delete = (p = "") => Route("delete", p);
