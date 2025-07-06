import {
    CallHandler,
    ExecutionContext,
    Injectable,
    LoggerService,
    NestInterceptor
} from "@nestjs/common";
import type { Request } from "express";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

    constructor(private readonly logger: LoggerService) {
    }

    intercept(context: ExecutionContext, next: CallHandler) {
        const startDate = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startDate;
                const req = context.switchToHttp().getRequest<Request>();
                const method = req.method;
                const url = req.url;

                this.logger.log(`******* INTERCEPTED REQUEST ****** [${method}] - ${url} - ${duration}ms`);
            })
        );
    }
}
