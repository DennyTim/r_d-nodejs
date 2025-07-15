import {
    ArgumentMetadata,
    PIPES_METADATA,
    PipesType,
    PipeTransform
} from "../models";
import { Container } from "./container";
import { isClass } from "./is-class";

export function getPipes(
    handler: Function,
    controller: Function,
    globalPipes: PipesType[] = []
): PipesType[] {
    const classPipes = Reflect.getMetadata(PIPES_METADATA, controller) ?? [];
    const methodPipes = Reflect.getMetadata(PIPES_METADATA, handler) ?? [];
    return [...globalPipes, ...classPipes, ...methodPipes];
}

export async function runPipes(
    controllerCls: Function,
    handler: Function,
    value: unknown,
    meta: ArgumentMetadata,
    globalPipes: PipesType[] = []
) {
    if (meta.pipe) {
        const pipeInstance = isClass(meta.pipe)
            ? Container.resolve<PipeTransform>(meta.pipe)
            : meta.pipe;

        return await pipeInstance.transform(value, meta);
    }

    const pipes = getPipes(handler, controllerCls, globalPipes);

    let transformed = value;

    for (const pipe of pipes) {
        const pipeInstance = isClass(pipe)
            ? Container.resolve<PipeTransform>(pipe)
            : pipe;

        transformed = await Promise.resolve(
            pipeInstance.transform(transformed, meta)
        );
    }
    return transformed;
}
