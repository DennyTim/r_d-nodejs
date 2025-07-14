import {
    NextFunction,
    Request,
    Response
} from "express";
import { Type } from "../models";
import { runGuards } from "../utils";

export const GuardsMiddleware = (
    Ctl: Type,
    handler: Function,
    globalGuards: Array<Type> = []
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const guardResult = await runGuards(Ctl, handler, req, res, globalGuards);

        if (typeof guardResult !== "string") {
            return next();
        }

        res.status(403).json({ message: `Forbidden by ${guardResult}` });
    };
};
