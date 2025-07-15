import {
    Injectable,
    Interceptor
} from "../../core";

@Injectable()
export class ResponseTimerInterceptor implements Interceptor {
    async intercept(_: { req: Request; res: Response }, next: () => Promise<any>) {
        const start = Date.now();
        const result = await next();
        const time = Date.now() - start;
        console.log(`⏱ Request took ${time}ms`);
        return result;
    }
}
