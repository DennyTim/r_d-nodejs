import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext
} from "@nestjs/common";
import type { Request } from "express";
import { ZodType } from "zod";

export function ZQuery<TOutput, TInput = unknown>(
    schema: ZodType<TOutput, any, TInput>
) {
    return createParamDecorator(
        (_: unknown, ctx: ExecutionContext): TOutput => {
            const request = ctx.switchToHttp().getRequest<Request>();
            const query = request.query as TInput;

            const result = schema.safeParse(query);

            if (!result.success) {
                throw new BadRequestException(result.error.format());
            }

            return result.data;
        }
    )();
}
