import { NestFactory } from "@nestjs/core";
import { DemoModule } from "./demo.module";

async function bootstrap() {
    const app = await NestFactory.create(DemoModule);

    const port = process.env.PORT ?? 3000;

    await app.listen(port);
}

void bootstrap();
