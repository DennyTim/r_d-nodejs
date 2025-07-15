import {
    CanActivate,
    ExecutionContext,
    Injectable
} from "../../core";
import { HttpException } from "../../core/exceptions/http.exception";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest();
        const token = req.headers["authorization"];

        if (!token || !token.startsWith("Bearer ")) {
            throw new HttpException(401, "Unauthorized");
        }

        return true;
    }
}
