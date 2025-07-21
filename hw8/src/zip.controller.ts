import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ZipService } from "./zip.service";

@Controller("zip")
export class ZipController {
    constructor(private readonly zipService: ZipService) {
    }

    @Post("/")
    @UseInterceptors(FileInterceptor("file"))
    async uploadZipFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: ".(zip)" })
                ]
            })
        ) file: Express.Multer.File
    ) {
        const t0 = performance.now();

        const { processed, skipped } = await this.zipService.processImages(file);

        return {
            processed: processed,
            skipped: skipped,
            durationMs: performance.now() - t0
        };
    }
}
