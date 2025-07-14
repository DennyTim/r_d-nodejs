import { Type } from "../models";

export function isClass<T>(obj: any): obj is Type<T> {
    return "prototype" in obj;
}
