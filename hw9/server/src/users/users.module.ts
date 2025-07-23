import { Module } from "@nestjs/common";
import { FileStore } from "../store/file-store";
import { UsersController } from "./users.controller";

@Module({
    controllers: [UsersController],
    providers: [FileStore],
    exports: [FileStore]
})
export class UsersModule {
}
