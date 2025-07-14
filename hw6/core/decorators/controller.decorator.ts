import { CTRL_PREFIX } from "../models";

export function Controller(prefix = "") {
    return function(target: any) {
        Reflect.defineMetadata(CTRL_PREFIX, prefix, target);
    };
}

export const isController = (target: any) => {
    return Reflect.hasMetadata(CTRL_PREFIX, target);
};
