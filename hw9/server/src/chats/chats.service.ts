import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import * as crypto from "crypto";
import { ChatDTO } from "../dto";
import { FileStore } from "../store/file-store";
import { ChatGateway } from "../ws/chat.gateway";

@Injectable()
export class ChatsService {
    constructor(
        private store: FileStore,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway
    ) {
    }

    public async createChat(body: { name?: string; members: string[] }, creator: string): Promise<ChatDTO> {
        const chatId = crypto.randomUUID();

        let members = [];

        if (body.members.includes(creator)) {
            members = body.members;
        } else {
            members = [creator, ...body.members];
        }

        let chatName = body.name;

        if (!chatName && members.length === 2) {
            const [userA, userB] = members;
            chatName = `${userA} & ${userB}`;
        } else if (!chatName) {
            chatName = `Group Chat ${members.length} members`;
        }

        const chat = {
            id: chatId,
            name: chatName,
            members: members,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: creator
        };

        const chats = await this.store.readChats();
        chats.push(chat);
        await this.store.writeChats(chats);

        const chatDto = this.mapToDto(chat);

        await this.chatGateway.notifyChatCreated(chatDto);

        return chatDto;
    }

    public async getUserChats(user: string) {
        const chats = await this.store.readChats();

        const userChats = chats.filter(chat =>
            chat.members.includes(user)
        );

        return {
            items: userChats.map(chat => this.mapToDto(chat))
        };
    }

    public async updateChatMembers(
        chatId: string,
        dto: { add?: string[]; remove?: string[] },
        actor: string
    ) {
        const chats = await this.store.readChats();
        const chat = chats.find(item => item.id === chatId);

        if (!chat) {
            throw new NotFoundException("Chat not found");
        }

        if (chat.createdBy !== actor) {
            throw new ForbiddenException("Only chat creator can modify members");
        }

        let updatedMembers = [...chat.members];

        if (dto.add?.length) {
            dto.add.forEach(member => {
                if (!updatedMembers.includes(member)) {
                    updatedMembers.push(member);
                }
            });
        }

        if (dto.remove?.length) {
            dto.remove.forEach((member) => {
                if (member !== chat.createdBy) {
                    updatedMembers = updatedMembers.filter(m => m !== member);
                }
            });
        }

        if (updatedMembers.length === 0) {
            throw new BadRequestException("Chat must have at least one member");
        }

        chat.members = updatedMembers;
        chat.updatedAt = new Date().toISOString();


        if (updatedMembers.length === 2 && !chat.name.includes("Group")) {
            const [userA, userB] = updatedMembers;
            chat.name = `${userA} & ${userB}`;
        }

        await this.store.writeChats(chats);
        await this.chatGateway.notifyMembersUpdated(chatId, updatedMembers);

        return {
            id: chat.id,
            members: chat.members
        };
    }

    public async deleteChat(chatId: string, admin: string) {
        const chats = await this.store.readChats();

        const chatIndex = chats.findIndex(chat => chat.id === chatId);

        if (chatIndex === -1) {
            throw new NotFoundException("Chat not found");
        }

        const chat = chats[chatIndex];

        if (chat.createdBy !== admin) {
            throw new ForbiddenException("Only chat creator can delete chat");
        }

        chats.splice(chatIndex, 1);
        await this.store.writeChats(chats);
    }

    private mapToDto(chat: Record<string, any>): ChatDTO {
        return {
            id: chat.id,
            name: chat.name,
            members: chat.members,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            createdBy: chat.createdBy
        };
    }
}
