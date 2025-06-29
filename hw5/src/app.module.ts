import {
    Logger,
    MiddlewareConsumer,
    Module
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import getConfig from "./config/configuration";
import { LoggerMiddleware } from "./shared/middlewares/logger.middleware";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                getConfig
            ]
        })
    ],
    providers: [Logger]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes("*");
    }
}
