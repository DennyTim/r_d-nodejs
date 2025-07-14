import {
    NextFunction,
    Request,
    Response
} from "express";
import { Type } from "../models";
import { runInterceptors } from "../utils";

export const InterceptorsMiddleware = (
    Ctl: Type,
    handler: Function,
    globalInterceptors: Array<Type> = []
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const handlerFn = () => new Promise((resolve) => {
            (req as any)._handlerWrapped = (...args: any[]) => resolve(args[0]);
            next();
        });

        try {
            const result = await runInterceptors(Ctl, handler, req, res, handlerFn, globalInterceptors);
            if (!res.headersSent) {
                res.json(result);
            }
        } catch (err) {
            next(err);
        }
    };
};
