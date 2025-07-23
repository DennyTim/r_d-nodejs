import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { UserDTO } from "../dto";
import { FileStore } from "../store/file-store";

@Controller("/api/users")
export class UsersController {
    constructor(private store: FileStore) {
    }

    @Post()
    @UseInterceptors(FileInterceptor("icon"))
    createUser(
        @Body("name") name: string,
        @UploadedFile() icon?: Express.Multer.File
    ): UserDTO {
        throw new ForbiddenException("Not implemented yet");
    }

    @Get()
    list(): { items: UserDTO[]; total: number } {
        throw new ForbiddenException("Not implemented yet");
    }

    @Get("icons/:iconPath")
    async icon(@Param("iconPath") iconPath: string, @Res() res: Response) {
        throw new ForbiddenException("Not implemented yet");
    }
}
