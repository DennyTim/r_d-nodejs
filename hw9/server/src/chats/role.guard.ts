import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.get<string>('role', context.getHandler());

        if (!requiredRole) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userHeader = request.headers['x-user'];

        if (!userHeader) {
            throw new ForbiddenException('X-User header is required');
        }

        if (requiredRole === 'admin' && userHeader !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }

        if (requiredRole === 'user' && userHeader === 'admin') {
            throw new ForbiddenException('User access only');
        }

        if (requiredRole === 'creator') {
            return true;
        }

        return true;
    }
}
