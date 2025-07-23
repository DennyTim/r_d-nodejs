import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ChatsController } from "./chats.controller";

@Module({
    imports: [UsersModule],
    controllers: [ChatsController]
})
export class ChatsModule {
}
