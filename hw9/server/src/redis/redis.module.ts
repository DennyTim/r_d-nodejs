import {
    DynamicModule,
    Global,
    Module
} from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";

@Global()
@Module({})
export class RedisModule {
    static forRoot(options: RedisOptions & { url: string }): DynamicModule {
        const provider = {
            provide: Redis,
            useFactory: () => new Redis(options.url)
        };

        return {
            module: RedisModule,
            providers: [provider],
            exports: [provider]
        };
    }
}
