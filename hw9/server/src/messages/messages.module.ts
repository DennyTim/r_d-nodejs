import { Module } from "@nestjs/common";
import { FileStore } from "../store/file-store";
import { MessagesController } from "./messages.controller";

@Module({
    controllers: [MessagesController],
    providers: [FileStore]
})
export class MessagesModule {
}
