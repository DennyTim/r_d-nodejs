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
            console.log("Received event:", parsed);
            this.event$.next(parsed);
        });

        this.event$
            .pipe(filter((e) => e.meta?.local))
            .subscribe((e) =>
                this.redis.publish("chat-events", JSON.stringify({
                    ...e,
                    meta: undefined,
                    src: INSTANCE_ID
                }))
            );

        this.event$
            .pipe(filter((e) => !e.meta?.local))
            .subscribe((e) => this.handleRemoteEvent(e));
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

        this.event$
            .pipe(filter(event => {
                const user = client.data.user;

                if (event.meta?.targetUsers) {
                    return event.meta.targetUsers.includes(user!);
                }

                if (event.meta?.targetChat) {
                    return client.data.joinedChats?.has(event.meta.targetChat) || false;
                }

                return false;
            }))
            .subscribe((event) => {
                client.emit(event.ev, event.data);
            });

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

    private handleRemoteEvent(event: ChatEvent) {
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
        } else {
            this.server?.to(`chat:${event.meta?.targetChat}`).emit(event.ev, event.data);
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

        client.join(`chat:${chatId}`);
        client.data.joinedChats?.delete(chatId);

        this.logger.log(`User ${user} left chat ${chatId}`);
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

            this.event$.next({
                ev: "typing",
                data: typingData,
                meta: {
                    local: true,
                    targetChat: chatId
                }
            });

            client.to(`chat:${chatId}`).emit("typing", typingData);
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

        for (const member of chat.members) {
            const userSocketSet = this.userSockets.get(member);

            if (userSocketSet) {
                userSocketSet.forEach(socketId => {
                    const socket = this.server?.sockets.sockets.get(socketId);
                    if (socket) {
                        socket.emit("chatCreated", chat);
                    }
                });
            }
        }

        this.logger.log(`Chat created notification sent for chat ${chat.id}`);
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

        for (const member of members) {
            const userSocketSet = this.userSockets.get(member);
            if (userSocketSet) {
                userSocketSet.forEach(socketId => {
                    const socket = this.server?.sockets.sockets.get(socketId);

                    if (socket) {
                        socket.emit("membersUpdated");
                    }
                });
            }
        }

        this.logger.log(`Members updated notification sent for chat ${chatId}`);
    }
}
