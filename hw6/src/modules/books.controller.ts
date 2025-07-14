import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
    UsePipes,
    ZodValidationPipe
} from "../../core";
import { BooksService } from "./books.service";
import {
    CreateBookDto,
    createBookSchema
} from "./dto/create-book.dto";
import {
    Roles,
    RolesGuard
} from "./guards/roles.guard";

@Controller("/books")
@UseGuards(RolesGuard)
export class BooksController {
    constructor(private bookService: BooksService) {
    }

    @Get("/")
    @Roles("admin")
    public list() {
        return this.bookService.findAll();
    }

    @Get("/:id")
    public one(@Param("id") id: string) {
        return this.bookService.findOne(+id);
    }

    @Post("/")
    @UsePipes(new ZodValidationPipe(createBookSchema))
    public add(@Body() body: CreateBookDto) {
        return this.bookService.create(body);
    }

    @Put(":id")
    public updateTitle(
        @Param("id") id: string,
        @Body() body: { title: string }
    ) {
        return this.bookService.update(id, body.title);
    }
}
