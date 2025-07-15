import { NestFactory } from "../core";
import { NotFoundFilter } from "./filter/not-found.filter";
import { AuthGuard } from "./guards/auth.guard";
import { BooksModule } from "./modules/books/books.module";

import "reflect-metadata";
import {
    CONFIG_TOKEN,
    ConfigModule
} from "./modules/config/config.module";


process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    // Handle the error or exit the process
    // process.exit(1); // Uncomment to exit the process
});

const app = NestFactory.init([
    ConfigModule.forRoot(),
    BooksModule
]);

app.useGlobalGuards([AuthGuard]);
app.useGlobalFilters([NotFoundFilter]);

const config = app.get(CONFIG_TOKEN);

app.listen(config.PORT, () => console.log(`Mini-Nest listening on http://localhost:${config.PORT}`));
