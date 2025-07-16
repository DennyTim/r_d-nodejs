import {
    ErrorRequestHandler,
    NextFunction,
    Request,
    Response
} from "express";
import { Type } from "../models";
import { runFilters } from "../utils";

export const FiltersMiddleware = (Ctl: Type, handler: Function, filters: Array<Type>): ErrorRequestHandler => {
    return async (err: any, req: Request, res: Response, _next: NextFunction) => {
        try {
            await runFilters(Ctl, handler, req, res, err, filters);
        } catch {
            err.stack = undefined;
            res
                .status((err as Error & { status: number }).status || 500)
                .json({ error: err.message || "Server error" });
        }
    };
};
