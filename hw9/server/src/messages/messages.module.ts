import {
    forwardRef,
    Module
} from "@nestjs/common";
import { ChatsModule } from "../chats/chats.module";
import { RoleGuard } from "../chats/role.guard";
import { FileStore } from "../store/file-store";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";

@Module({
    imports: [
        forwardRef(() => ChatsModule)
    ],
    controllers: [MessagesController],
    providers: [
        MessagesService,
        RoleGuard,
        FileStore
    ],
    exports: [MessagesService]
})
export class MessagesModule {
}
