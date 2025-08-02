import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards
} from "@nestjs/common";
import {
    CurrentUser,
    User
} from "../chats/role.decorator";
import { RoleGuard } from "../chats/role.guard";
import { MessageDTO } from "../dto";
import { MessagesService } from "./messages.service";

@Controller("/api/chats/:id/messages")
@UseGuards(RoleGuard)
export class MessagesController {
    constructor(private messagesService: MessagesService) {
    }

    @Get()
    @User()
    async list(
        @CurrentUser() user: string,
        @Param("id") chatId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limit = "30"
    ) {
        return this.messagesService.getMessages(chatId, user, cursor, limit);
    }

    @Post()
    @User()
    async create(
        @CurrentUser() user: string,
        @Param("id") chatId: string,
        @Body("text") text: string
    ): Promise<MessageDTO> {
        return this.messagesService.createMessage(chatId, user, text);
    }
}
