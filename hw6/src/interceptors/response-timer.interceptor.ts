import {
    Request,
    Response
} from "express";
import {
    Injectable,
    Interceptor
} from "../../core";

@Injectable()
export class ResponseTimerInterceptor implements Interceptor {
    async intercept(
        ctx: { req: Request; res: Response },
        next: () => Promise<any>
    ) {
        const { req } = ctx;
        const start = Date.now();

        console.log(`[${req.method}] ${req.originalUrl} - start`);

        await new Promise(resolve => setTimeout(resolve, 100));

        const result = await next();

        const time = Date.now() - start;
        console.log(`[${req.method}] ${req.originalUrl} took ${time}ms`);

        return {
            data: result,
            durationMs: time
        };
    }
}
