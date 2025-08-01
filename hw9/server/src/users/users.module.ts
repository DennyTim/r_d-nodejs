import { Module } from "@nestjs/common";
import { FileStore } from "../store/file-store";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        FileStore
    ],
    exports: [FileStore]
})
export class UsersModule {
}
