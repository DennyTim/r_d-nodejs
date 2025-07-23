import {
    ForbiddenException,
    OnModuleDestroy
} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets";
import Redis from "ioredis";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import { FileStore } from "../store/file-store";

const EVENT_DATA = {};

const INSTANCE_ID = uuid();

@WebSocketGateway({
    path: "/ws",
    cors: true
})
export class ChatGateway implements OnGatewayConnection, OnModuleDestroy {
    private readonly sub: Redis;
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
                this.redis.publish("chat-events", JSON.stringify({ ...e, meta: undefined, src: INSTANCE_ID }))
            );
    }

    onModuleDestroy() {
        this.sub.disconnect();
        this.redis.disconnect();
    }

    handleConnection(client: Socket) {
        const user = client.handshake.auth?.user as string;

        if (!user) {
            return client.disconnect(true);
        }
        client.data.user = user;

        // forward broadcast events belonging to this user
    }

    @SubscribeMessage("join")
    onJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string }
    ) {
        throw new ForbiddenException("Not implemented yet");
    }

    @SubscribeMessage("leave")
    onLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string }
    ) {
        throw new ForbiddenException("Not implemented yet");
    }

    @SubscribeMessage("send")
    onSend(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string; text: string }
    ) {
        this.event$.next({
            ev: "EVENT_NAME",
            data: {
                ...EVENT_DATA
            }
        });
    }

    @SubscribeMessage("typing")
    onTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { chatId: string; isTyping: boolean }
    ) {
        throw new ForbiddenException("Not implemented yet");
    }
}
