import {
    Request,
    Response
} from "express";
import {
    ArgumentMetadata,
    MINI_PARAMS,
    Type
} from "../models";
import {
    extractParams,
    runPipes
} from "../utils";

export class PipeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PipeError";
    }
}

const getHandlerArgs = async (Ctl: Function, handler: Function, req: Request, globalPipes: Array<Type>) => {
    const paramMeta: Array<ArgumentMetadata> = Reflect.getMetadata(MINI_PARAMS, Ctl) ?? [];

    const methodMeta: Array<ArgumentMetadata> = paramMeta.filter(m => m.name === handler.name);

    const sortedMeta = [...methodMeta].sort((a, b) => a.index - b.index);

    const args: any[] = [];

    for (const metadata of sortedMeta) {
        const extracted = extractParams(req, metadata.type);

        const argument = metadata.data ? extracted[metadata.data] : extracted;

        try {
            args[metadata.index] = await runPipes(Ctl, handler, argument, metadata, globalPipes);
        } catch (error: any) {
            throw new PipeError(`Pipe error for: ${error.message}`);
        }
    }

    return args;
};

export const PipesMiddleware = (
    instance: Type,
    handler: Function,
    globalPipes: Array<Type>
) => {
    return async (req: Request, res: Response) => {
        const args = await getHandlerArgs(instance.constructor, handler, req, globalPipes);

        const result = await handler.apply(instance, args);

        res.json(result);
    };
};
