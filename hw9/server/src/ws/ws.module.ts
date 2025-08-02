import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { FileStore } from "../store/file-store";
import { ChatGateway } from "./chat.gateway";

@Module({
    imports: [
        RedisModule
    ],
    providers: [
        ChatGateway,
        FileStore
    ],
    exports: [
        ChatGateway,
        FileStore
    ]
})
export class WsModule {
}
