import {
    createParamDecorator,
    ExecutionContext,
    SetMetadata
} from "@nestjs/common";

export const User = () => SetMetadata('role', 'user');
export const Admin = () => SetMetadata('role', 'admin');
export const Creator = () => SetMetadata('role', 'creator');

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.headers['x-user'];
    },
);
