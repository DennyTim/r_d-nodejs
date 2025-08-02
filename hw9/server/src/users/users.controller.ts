import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { UserDTO } from "../dto";
import { UsersService } from "./users.service";

@Controller("/api/users")
export class UsersController {
    constructor(private usersService: UsersService) {
    }

    @Post()
    @UseInterceptors(FileInterceptor("icon", {
        fileFilter(
            _,
            file,
            callback: (error: (Error | null), acceptFile: boolean) => void
        ) {
            const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];

            if (allowedMimes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(new HttpException("Incorrect File", HttpStatus.BAD_REQUEST), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    }))
    createUser(
        @Body("name") name: string,
        @UploadedFile() icon?: Express.Multer.File
    ): Promise<UserDTO> {
        return this.usersService.createUser(name, icon);
    }

    @Get("default/picture")
    async getDefaultIcon(@Res() res: Response): Promise<void> {
        try {

            const iconBuffer = await this.usersService.getPlaceholderIcon();
            res.set({
                "Content-Type": "image/png",
                "Content-Length": iconBuffer.length.toString()
            });

            res.status(HttpStatus.OK).send(iconBuffer);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error generating default icon");
        }
    }

    @Get("icons/:iconPath")
    async icon(
        @Param("iconPath") iconPath: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const iconBuffer = await this.usersService.getIconByPath(iconPath);

            res.set({
                "Content-Type": "image/png",
                "Content-Length": iconBuffer.length.toString()
            });

            res.status(HttpStatus.OK).send(iconBuffer);
        } catch (error) {

            res.status(HttpStatus.NOT_FOUND).send("Icon not found");
        }
    }

    @Get()
    async list(): Promise<{ items: UserDTO[]; total: number }> {
        return this.usersService.getAll();
    }
}
