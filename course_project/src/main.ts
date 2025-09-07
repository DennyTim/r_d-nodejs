import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
    DocumentBuilder,
    SwaggerModule
} from "@nestjs/swagger";
import { AppModule } from "./app.module";

(async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));

    const config = new DocumentBuilder()
        .setTitle("Social Network API")
        .setDescription("A simple social network API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    await app.listen(process.env.PORT ?? 3000);
    console.log("Application is running on: http://localhost:3000");
    console.log("Swagger documentation: http://localhost:3000/api/docs");
})();
