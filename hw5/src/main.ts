import { Logger } from "@nestjs/common";
import {
    NestFactory,
    Reflector
} from "@nestjs/core";
import {
    DocumentBuilder,
    SwaggerModule
} from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ApiKeyGuard } from "./shared/guards/api-key.guard";
import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";
import { setupGracefulShutdown } from "./shared/modules/graceful-shutdown/setup";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const logger = app.get(Logger);
    const reflector = app.get(Reflector);
    /**
     *  global middlewares / pipes / interceptors
     *  */
    // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.useGlobalGuards(new ApiKeyGuard(reflector));

    /**
     * Setup graceful shutdown
     * */
    setupGracefulShutdown({ app });

    /**
     *  Swagger
     *  */
    if (process.env.NODE_ENV !== "production") {
        const swaggerCfg = new DocumentBuilder()
            .setTitle("Tea‑Tracker API")
            .setDescription("NestJS + TypeScript + Zod")
            .setVersion("1.0")
            .addApiKey(
                {
                    type: "apiKey",
                    name: "x-api-key",
                    in: "header"
                },
                "x-api-key"
            )
            .build();

        const document = SwaggerModule.createDocument(app, swaggerCfg);
        SwaggerModule.setup("docs", app, document);
    }

    const port = process.env.PORT ?? 3000;

    logger.log(`Swagger docs available at http://localhost:${port}/docs`);

    await app.listen(port);
}

void bootstrap();
