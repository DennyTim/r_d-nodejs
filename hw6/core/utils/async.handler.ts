import {
    NextFunction,
    Request,
    Response
} from "express";

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
};
