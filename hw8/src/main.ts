import { NestFactory } from "@nestjs/core";
import { json } from "express";
import { ZipModule } from "./zip.module";

void (async function bootstrap() {
    const app = await NestFactory.create(ZipModule);

    app.use(json({ limit: "100mb" }));

    await app.listen(process.env.PORT ?? 3000);
})();
