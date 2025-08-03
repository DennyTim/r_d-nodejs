import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { memoryStorage } from "multer";
import { join } from "path";
import { ChatsModule } from "./chats/chats.module";
import { MessagesModule } from "./messages/messages.module";
import { RedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";
import { WsModule } from "./ws/ws.module";

@Module({
    imports: [
        MulterModule.register({ storage: memoryStorage() }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "public"),
            serveRoot: "/public"
        }),
        RedisModule.forRoot({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        }),
        UsersModule,
        ChatsModule,
        MessagesModule,
        WsModule
    ]
})
export class AppModule {
}
