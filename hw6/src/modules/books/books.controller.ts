import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseFilter,
    UseGuards,
    UseInterceptor,
    UsePipes,
    ZodValidationPipe
} from "../../../core";
import { HttpException } from "../../../core/exceptions/http.exception";
import {
    CreateBookDto,
    createBookSchema
} from "../../dto/create-book.dto";
import { HttpErrorFilter } from "../../filter/http-error.filter";
import {
    Roles,
    RolesGuard
} from "../../guards/roles.guard";
import { ResponseTimerInterceptor } from "../../interceptors/response-timer.interceptor";
import { ParseIntPipe } from "../../pipes/parse-int.pipe";
import { BooksService } from "./books.service";

@Controller("/books")
@UseGuards(RolesGuard)
export class BooksController {
    constructor(private bookService: BooksService) {
    }

    @Get("/search")
    public search(
        @Query("q") query: string,
        @Query("limit", new ParseIntPipe()) limit: number
    ) {
        return this.bookService
            .findAll()
            .filter(book => book.title.includes(query))
            .slice(0, limit);
    }

    @Get("/fail")
    @UseFilter(HttpErrorFilter)
    public failExample() {
        throw new HttpException(400, "Manual error");
    }

    @Get("/timed")
    @UseInterceptor(ResponseTimerInterceptor)
    public timed() {
        return this.bookService.findAll();
    }

    @Get("/")
    @Roles("admin")
    public list() {
        return this.bookService.findAll();
    }

    @Get("/:id")
    public one(@Param("id", new ParseIntPipe()) id: number) {
        return this.bookService.findOne(id);
    }

    @Post("/")
    @UsePipes(new ZodValidationPipe(createBookSchema))
    public add(@Body() body: CreateBookDto) {
        return this.bookService.create(body);
    }

    @Put("/:id")
    public updateTitle(
        @Param("id", new ParseIntPipe()) id: string,
        @Body() body: { title: string }
    ) {
        return this.bookService.update(id, body.title);
    }

    @Patch("/:id")
    public patchDescription(
        @Param("id", new ParseIntPipe()) id: string,
        @Body() body: { description: string }
    ) {
        return this.bookService.updateDescription(+id, body.description);
    }

    @Delete("/:id")
    public deleteBook(@Param("id", new ParseIntPipe()) id: string) {
        return this.bookService.remove(+id);
    }
}
