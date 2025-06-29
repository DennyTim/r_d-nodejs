import {
    Injectable,
    Logger,
    NestMiddleware
} from "@nestjs/common";
import {
    NextFunction,
    Request,
    Response
} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

    constructor(private readonly logger: Logger) {
    }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        const { method, originalUrl } = req;
        const msg = `${method} ${originalUrl} – ${Date.now() - start}ms`;

        res.on("finish", () => this.logger.log(msg));

        next();
    }
}
