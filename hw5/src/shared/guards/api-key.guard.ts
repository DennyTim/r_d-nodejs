import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers["x-api-key"];

        if (apiKey !== "im_rd_student") {
            throw new ForbiddenException("Invalid API Key");
        }

        return true;
    }
}
