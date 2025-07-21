import { Injectable } from "@nestjs/common";
import { ArchiveService } from "./services/archive.service";
import { ImgService } from "./services/img.service";

@Injectable()
export class ZipService {

    constructor(
        private archiveService: ArchiveService,
        private imgService: ImgService
    ) {
    }

    async processImages(file: Express.Multer.File) {
        const { id, extractedTo } = await this.archiveService.extract(file);

        return this.imgService.processThumb(id, extractedTo);
    }
}
