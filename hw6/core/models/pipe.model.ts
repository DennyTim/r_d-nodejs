import { ArgumentMetadata } from "./argument-metadata.model";

export interface PipeTransform<T = any, R = any> {
    transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}
