import {
    forwardRef,
    Module
} from "@nestjs/common";
import { FileStore } from "../store/file-store";
import { UsersModule } from "../users/users.module";
import { WsModule } from "../ws/ws.module";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { RoleGuard } from "./role.guard";

@Module({
    imports: [
        forwardRef(() => WsModule),
        UsersModule
    ],
    providers: [
        ChatsService,
        RoleGuard,
        FileStore
    ],
    controllers: [ChatsController],
    exports: [
        ChatsService,
        FileStore
    ]
})
export class ChatsModule {
}
