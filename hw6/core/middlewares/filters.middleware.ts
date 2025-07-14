import {
    Request,
    Response
} from "express";
import { Type } from "../models";
import { runFilters } from "../utils";

export const FiltersMiddleware = (
    Ctl: Type,
    handler: Function,
    globalFilters: Array<Type> = []
) => {
    return async (err: any, req: Request, res: Response) => {
        try {
            await runFilters(Ctl, handler, req, res, err, globalFilters);
        } catch (e) {
            res.status(500).json({ message: "Unhandled exception in filter chain" });
        }
    };
};
