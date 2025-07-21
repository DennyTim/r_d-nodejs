import { Module } from "@nestjs/common";
import { ArchiveService } from "./services/archive.service";
import { ImgService } from "./services/img.service";
import { ZipController } from "./zip.controller";
import { ZipService } from "./zip.service";

@Module({
    imports: [],
    controllers: [ZipController],
    providers: [
        ZipService,
        ArchiveService,
        ImgService
    ]
})
export class ZipModule {
}
