import {
    ForbiddenException,
    Logger,
    OnModuleDestroy
} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import * as crypto from "crypto";
import Redis from "ioredis";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import {
    Server,
    Socket
} from "socket.io";
import { v4 as uuid } from "uuid";
import {
    ChatDTO,
    MessageDTO
} from "../dto";
import { FileStore } from "../store/file-store";

const INSTANCE_ID = uuid();

interface ChatEvent {
    ev: string;
    data: any;
    meta?: {
        local?: boolean;
        targetUsers?: string[];
        targetChat?: string;
    };
    src?: string;
}

@WebSocketGateway({
    path: "/ws",
    cors: true
})
export class ChatGateway implements OnGatewayConnection, OnModuleDestroy {
    @WebSocketServer()
    private server: Server | undefined;
    private readonly sub: Redis;
    private userSockets = new Map<string, Set<string>>();
    private logger = new Logger("ChatGateway");
    private event$ = new Subject<{ ev: string; data: any; meta?: any }>();

    constructor(
        private store: FileStore,
        private readonly redis: Redis
    ) {
        this.sub = this.redis.duplicate();

        this.sub.subscribe("chat-events");
        this.sub.on("message", (_, raw) => {
            const parsed = JSON.parse(raw);
            if (parsed.src === INSTANCE_ID) {
                return;
            }
            console.log("Received remote event:", parsed);
            this.handleRemoteEvent(parsed);
        });

        this.event$
            .pipe(filter((e) => e.meta?.local))
            .subscribe((e) => {
                this.handleLocalEvent(e);
                this.redis.publish("chat-events", JSON.stringify({
                    ...e,
                    meta: { ...e.meta, local: false }, // Прибираємо local flag
                    src: INSTANCE_ID
                }));
            });
    }

    onModuleDestroy() {
        this.sub.disconnect();
        this.redis.disconnect();
    }

    handleConnection(client: Socket) {
        const user = client.handshake.auth?.user as string;

        if (!user) {
            this.logger.warn("Connection rejected: missing user in auth");
            return client.disconnect(true);
        }
        client.data.user = user;
        client.data.joinedChats = new Set();

        if (!this.userSockets.has(user)) {
            this.userSockets.set(user, new Set());
        }

        this.userSockets.get(user)!.add(client.id);
        this.logger.log(`User ${user} connected with socket ${client.id}`);

        client.on("disconnect", () => {
            const user = client.data.user;

            if (!user) {
                return;
            }

            const userSocketSet = this.userSockets.get(user);
            if (userSocketSet) {
                userSocketSet.delete(client.id);

                if (userSocketSet.size === 0) {
                    this.userSockets.delete(user);
                }
            }

            this.logger.log(`User ${user} disconnected`);
        });
    }

    private handleLocalEvent(event: ChatEvent) {
        this.logger.log(`Handling local event: ${event.ev}`);

        if (event.meta?.targetUsers) {
            // Відправляємо конкретним користувачам
            event.meta.targetUsers.forEach((user) => {
                const userSocketSet = this.userSockets.get(user);
                if (userSocketSet) {
                    userSocketSet.forEach(socketId => {
                        const socket = this.server?.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.emit(event.ev, event.data);
                        }
                    });
                }
            });
        } else if (event.meta?.targetChat) {
            // Відправляємо в чат
            this.server?.to(`chat:${event.meta.targetChat}`).emit(event.ev, event.data);
        }
    }

    private handleRemoteEvent(event: ChatEvent) {
        this.logger.log(`Handling remote event: ${event.ev}`);

        if (event.meta?.targetUsers) {
            event.meta.targetUsers.forEach((user) => {
                const userSocketSet = this.userSockets.get(user);
                if (userSocketSet) {
                    userSocketSet.forEach(socketId => {
                        const socket = this.server?.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.emit(event.ev, event.data);
                        }
                    });
                }
            });
        } else if (event.meta?.targetChat) {
            this.server?.to(`chat:${event.meta.targetChat}`).emit(event.ev, event.data);
        }
    }

    @SubscribeMessage("join")
    async onJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string }
    ) {
        try {
            const user = client.data.user;
            const { chatId } = body;

            const chats = await this.store.readChats();
            const hasAccess = chats.some(chat =>
                chat.id === chatId && chat.members.includes(user)
            );

            if (!hasAccess) {
                await Promise.reject(new ForbiddenException("You are not a member of this chat"));
            }

            client.join(`chat:${chatId}`);
            client.data.joinedChats.add(chatId);

            this.logger.log(`User ${user} joined chat ${chatId}`);
        } catch (error: any) {
            this.logger.error("Join error: ", error);
            client.emit("error", { message: error.message });
        }
    }

    @SubscribeMessage("leave")
    onLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string }
    ) {
        const user = client.data.user;
        const { chatId } = body;

        if (user) {
            //TODO: if user isn't chat member
        }

        client.leave(`chat:${chatId}`);
        client.data.joinedChats?.delete(chatId);
    }

    @SubscribeMessage("send")
    async onSend(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string; text: string }
    ) {
        try {
            const user = client.data.user;
            const { chatId, text } = body;

            if (!text || text.trim() === "") {
                client.emit("error", { message: "Message text cannot be empty" });
                return;
            }

            const chats = await this.store.readChats();
            const hasAccess = chats.some(chat =>
                chat.id === chatId && chat.members.includes(user)
            );

            if (!hasAccess) {
                client.emit("error", { message: "You are not a member of this chat" });
                return;
            }

            const newMessage = {
                id: crypto.randomUUID(),
                chatId,
                author: user,
                text: text.trim(),
                sentAt: new Date().toISOString()
            };

            const messages = await this.store.readMessages();
            messages.push(newMessage);
            await this.store.writeMessages(messages);

            const messageDto: MessageDTO = {
                id: newMessage.id,
                chatId,
                author: newMessage.author,
                text: newMessage.text,
                sentAt: newMessage.sentAt
            };

            this.event$.next({
                ev: "message",
                data: messageDto,
                meta: {
                    local: true,
                    targetChat: chatId
                }
            });
        } catch (error: any) {
            this.logger.error(`Send error:`, error);
            client.emit("error", { message: error.message });
        }
    }

    @SubscribeMessage("typing")
    onTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string; isTyping: boolean }
    ) {
        try {
            const user = client.data.user;
            const { chatId, isTyping } = body;

            const typingData = { chatId, user, isTyping };

            client.to(`chat:${chatId}`).emit("typing", typingData);
            this.event$.next({
                ev: "typing",
                data: typingData,
                meta: {
                    local: true,
                    targetChat: chatId
                }
            });
        } catch (error: any) {
            this.logger.error("Typing error:", error);
        }
    }

    async notifyChatCreated(chat: ChatDTO) {
        this.event$.next({
            ev: "chatCreated",
            data: chat,
            meta: {
                local: true,
                targetUsers: chat.members
            }
        });
    }

    async notifyMembersUpdated(chatId: string, members: string[]) {
        const payload = { chatId, members };

        this.event$.next({
            ev: "membersUpdated",
            data: payload,
            meta: {
                local: true,
                targetUsers: members
            }
        });

        this.logger.log(`Members updated notification sent for chat ${chatId}`);
    }
}
