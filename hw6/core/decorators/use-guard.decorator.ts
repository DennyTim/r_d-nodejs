import { GUARDS_METADATA } from "../models";

export const UseGuards = (...guards: Function[]): ClassDecorator & MethodDecorator => {
    return (target: any, key?: string | symbol) => {
        if (key) {
            Reflect.defineMetadata(GUARDS_METADATA, guards, target[key]);
        } else {
            Reflect.defineMetadata(GUARDS_METADATA, guards, target);
        }
    };
};

