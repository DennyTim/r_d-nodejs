import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards
} from "@nestjs/common";
import { ChatDTO } from "../dto";
import { ChatsService } from "./chats.service";
import {
    Admin,
    Creator,
    CurrentUser,
    User
} from "./role.decorator";
import { RoleGuard } from "./role.guard";

@Controller("/api/chats")
@UseGuards(RoleGuard)
export class ChatsController {
    constructor(private readonly chatService: ChatsService) {
    }

    @Post()
    @Creator()
    async create(
        @Body() body: { name?: string; members: string[] },
        @CurrentUser() creator: string
    ): Promise<ChatDTO> {
        return this.chatService.createChat(body, creator);
    }

    @Get()
    @User()
    async list(@CurrentUser() user: string): Promise<{ items: ChatDTO[] }> {
        return this.chatService.getUserChats(user);
    }

    @Patch(":id/members")
    @Admin()
    async patch(
        @Param("id") chatId: string,
        @Body() dto: { add?: string[]; remove?: string[] },
        @CurrentUser() actor: string
    ) {
        const result = await this.chatService.updateChatMembers(chatId, dto, actor);

        return {
            id: result.id,
            members: result.members
        };
    }

    @Delete(":id")
    @Admin()
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id") chatId: string,
        @CurrentUser() admin: string
    ) {
        return this.chatService.deleteChat(chatId, admin);
    }
}
