import { PIPES_METADATA } from "../models";
import { PipesType } from "../models";

export const UsePipes = (...pipes: PipesType[]) => {
    return (target: any, key: string | symbol) => {
        const where = key ? target[key] : target;

        Reflect.defineMetadata(PIPES_METADATA, pipes, where);
    };
};

