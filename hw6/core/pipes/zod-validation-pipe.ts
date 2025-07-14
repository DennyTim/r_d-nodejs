import { ZodError } from "zod";
import { PipeTransform } from "../models";

export class ZodValidationException<T> extends Error {
    public readonly issues;

    constructor(error: ZodError<T>) {
        super("Validation failed");
        this.name = "ZodValidationException";
        this.issues = error.issues;
    }
}

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: any) {
    }

    transform(value: any) {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            throw new ZodValidationException<any>(result.error);
        }

        return result.data;
    }
}
