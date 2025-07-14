import { Module } from "../../core";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
    controllers: [BooksController],
    providers: [BooksService]
})
export class BooksModule {
}
