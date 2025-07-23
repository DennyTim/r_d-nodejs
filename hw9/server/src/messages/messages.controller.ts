import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    Param,
    Post,
    Query
} from "@nestjs/common";
import { MessageDTO } from "../dto";
import { FileStore } from "../store/file-store";

@Controller("/api/chats/:id/messages")
export class MessagesController {
    constructor(private store: FileStore) {
    }

    @Get()
    list(
        @Headers("X-User") user: string,
        @Param("id") chatId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limit = "30"
    ) {
        throw new ForbiddenException("Not implemented yet");
    }

    @Post()
    create(
        @Headers("X-User") author: string,
        @Param("id") chatId: string,
        @Body("text") text: string
    ): MessageDTO {
        throw new ForbiddenException("Not implemented yet");
    }
}
