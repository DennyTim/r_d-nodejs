import { Module } from "../../../core";
import { ConfigModule } from "../config/config.module";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
    imports: [ConfigModule],
    controllers: [BooksController],
    providers: [BooksService]
})
export class BooksModule {
}
