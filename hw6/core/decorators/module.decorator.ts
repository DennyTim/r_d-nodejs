import {
    MODULE_METADATA,
    ModuleOptions
} from "../models";

export function Module(metadata: ModuleOptions) {
    return function(target: any) {
        Reflect.defineMetadata(MODULE_METADATA, metadata, target);
    };
}
