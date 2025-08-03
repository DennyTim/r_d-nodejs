import {
    BadRequestException,
    ForbiddenException,
    Injectable
} from "@nestjs/common";
import * as crypto from "crypto";
import { MessageDTO } from "../dto";
import { FileStore } from "../store/file-store";

@Injectable()
export class MessagesService {

    constructor(private store: FileStore) {
    }

    async getMessages(chatId: string, user: string, cursor: string | undefined, limit: string) {
        const chats = await this.store.readChats();
        const users = await this.store.readUsers();
        if (!users.some(item => item.name === user)) {
            throw new ForbiddenException(`Current user doesn't exist`);
        }

        const hasAccess = chats.some(chat => chat.id === chatId);
        if (!hasAccess) {
            throw new ForbiddenException(`You aren't a member of this chat`);
        }

        let messages = await this.store.readMessages();
        let chatMessages = messages.filter(msg => msg.chatId === chatId);

        if (cursor) {
            const cursorDate = new Date(cursor);
            chatMessages = chatMessages.filter(msg => new Date(msg.sentAt) < cursorDate);
        }

        chatMessages.sort((a, b) =>
            new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );

        const convertedLimit = Number(limit);

        if (!limit || isNaN(convertedLimit)) {
            throw new BadRequestException(`Incorrect limit`);
        }

        const limitedMessages = chatMessages.slice(0, convertedLimit);

        let nextCursor: string | undefined;

        if (limitedMessages.length === convertedLimit && chatMessages.length > convertedLimit) {
            nextCursor = limitedMessages[limitedMessages.length - 1].sentAt;
        }

        return {
            items: limitedMessages.map(msg => this.mapToDto({ ...msg })),
            nextCursor
        };
    }

    async createMessage(chatId: string, user: string, text: string) {
        const chats = await this.store.readChats();
        const hasAccess = chats.some(chat => chat.id === chatId);

        if (!hasAccess) {
            throw new ForbiddenException(`You aren't a member of this chat`);
        }

        const message: MessageDTO = {
            id: crypto.randomUUID(),
            chatId,
            author: user,
            text,
            sentAt: new Date().toISOString()
        };

        let messages = await this.store.readMessages();

        messages.push(message);

        return this.mapToDto({ ...message });
    }

    private mapToDto(message: Record<string, string>): MessageDTO {
        return {
            id: message.id,
            chatId: message.chatId,
            author: message.author,
            text: message.text,
            sentAt: message.sentAt
        };
    }
}
