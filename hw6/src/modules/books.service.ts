import { Injectable } from "../../core";
import { CreateBookDto } from "./dto/create-book.dto";

export interface Book {
    id: number;
    title: string;
}

@Injectable()
export class BooksService {
    #data: Book[] = [{ id: 1, title: "1984" }];

    findAll() {
        return this.#data;
    }

    findOne(id: number) {
        return this.#data.find(b => b.id === id);
    }

    create(body: CreateBookDto) {
        const book = {
            id: Date.now(),
            title: body.title,
            description: body.description
        };

        this.#data.push(book);

        return book;
    }

    update(id: string, title: string) {
        const numericId = Number(id);

        if (isNaN(numericId) || title) {
            return;
        }

        const bookIndex = this.#data.findIndex(item => item.id === numericId);

        if (bookIndex < 0) {
            return;
        }

        this.#data[bookIndex].title = title;

        return this.#data[bookIndex];
    }
}
