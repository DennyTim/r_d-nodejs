import { NestFactory } from "../core";
import { BooksModule } from "./modules/books.module";
import "reflect-metadata";

// catch uncaughtException
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    // Handle the error or exit the process
    // process.exit(1); // Uncomment to exit the process
});

const app = NestFactory.createApp([BooksModule]);

const port = 8081;

app.listen(port, () => console.log(`Mini-Nest listening on http://localhost:${port}`));
