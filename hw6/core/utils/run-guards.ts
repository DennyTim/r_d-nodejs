import {
    Request,
    Response
} from "express";
import {
    GUARDS_METADATA,
    Type
} from "../models";
import { Container } from "./container";
import { ExpressExecutionContext } from "./express-ctx";

const getGuards = (
    handler: Function,
    controllerClass: Function,
    globalGuards: Array<Type> = []
) => {
    const controllerGuards = Reflect.getMetadata(GUARDS_METADATA, controllerClass) ?? [];
    const routeGuards = Reflect.getMetadata(GUARDS_METADATA, handler) ?? [];

    globalGuards.push(
        ...controllerGuards,
        ...routeGuards
    );

    return globalGuards;
};

export async function runGuards(
    controllerClass: Function,
    handler: Function,
    req: Request,
    res: Response,
    globalGuards: Array<Type> = []
): Promise<boolean | string> {
    const guards = getGuards(handler, controllerClass, globalGuards);

    for (const guard of guards) {
        const guardInstance = Container.resolve(guard);
        const context = new ExpressExecutionContext(controllerClass, handler, req, res);
        const result = await Promise.resolve(guardInstance.canActivate(context));

        if (!result) {
            return guard.name;
        }
    }

    return true;
}
