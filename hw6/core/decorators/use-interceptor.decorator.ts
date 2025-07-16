import {
    INTERCEPTORS_METADATA,
    Type
} from "../models";

export const UseInterceptor = (...interceptors: Type[]) =>
    Reflect.metadata(INTERCEPTORS_METADATA, interceptors);
