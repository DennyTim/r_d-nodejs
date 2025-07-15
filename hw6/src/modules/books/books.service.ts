import {
    Inject,
    Injectable
} from "../../../core";
import { CreateBookDto } from "../../dto/create-book.dto";
import { LoggerService } from "../../services/logger.service";

export interface Book {
    id: number;
    title: string;
    description?: string;
}

@Injectable()
export class BooksService {
    #data: Book[] = [{ id: 1, title: "1984" }];

    constructor(
        @Inject(LoggerService)
        private logger: LoggerService
    ) {
    }

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

        this.logger.log("Book added!");

        return book;
    }

    update(id: string, title: string) {

        const numericId = Number(id);

        if (isNaN(numericId) || !title) {
            return Promise.reject(new Error("Incorrect id or title"));
        }

        const bookIndex = this.#data.findIndex(item => item.id === numericId);

        if (bookIndex < 0) {
            return Promise.reject(new Error("Book not found"));
        }

        this.#data[bookIndex].title = title;

        return this.#data[bookIndex];
    }

    updateDescription(id: number, description: string) {
        const book = this.#data.find(b => b.id === id);

        if (!book) {
            return Promise.reject(new Error("Book not found"));
        }

        book.description = description;

        return book;
    }

    remove(id: number) {
        const idx = this.#data.findIndex(b => b.id === id);

        if (idx < 0) {
            return Promise.reject(new Error("Book not found"));
        }

        const removed = this.#data.splice(idx, 1);
        return removed[0];
    }
}
