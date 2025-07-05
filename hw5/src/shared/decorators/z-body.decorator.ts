import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext
} from "@nestjs/common";
import type {
    infer as zInfer,
    ZodError,
    ZodSchema
} from "zod";

export const ZBody = <T extends ZodSchema>(schema: T): ParameterDecorator => {
    return createParamDecorator(
        async (_: unknown, ctx: ExecutionContext): Promise<zInfer<T>> => {
            const request: Request = ctx.switchToHttp().getRequest();

            try {
                return await schema.parseAsync(request.body) as Promise<zInfer<T>>;
            } catch (err) {
                const zodErr = err as ZodError;

                throw new BadRequestException("Validation failed", {
                    cause: zodErr,
                    description: JSON.stringify(zodErr.errors)
                });
            }
        }
    )();
};
