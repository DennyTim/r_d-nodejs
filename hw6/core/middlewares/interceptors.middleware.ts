import {
    NextFunction,
    Request,
    Response
} from "express";
import { Type } from "../models";
import {
    Container,
    runInterceptors
} from "../utils";

export const InterceptorsMiddleware = (
    controller: Type,
    handler: Function,
    globalInterceptors: Array<Type> = []
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await runInterceptors(
                controller,
                handler,
                req,
                res,
                async () => {
                    return handler.call(Container.resolve(controller), req, res);
                },
                globalInterceptors
            );

            if (!res.headersSent && result !== undefined) {
                res.json(result);
            }
        } catch (err) {
            next(err);
        }
    };
};
