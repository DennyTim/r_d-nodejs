import {
    Logger,
    MiddlewareConsumer,
    Module
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import getConfig from "./config/configuration";
import { LoggerMiddleware } from "./shared/middlewares/logger.middleware";
import { TeaModule } from "./tea/tea.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                getConfig
            ]
        }),
        TeaModule
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
