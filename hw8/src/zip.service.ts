import {
    Injectable,
    Logger
} from "@nestjs/common";
import { ArchiveService } from "./services/archive.service";
import { ImgService } from "./services/img.service";

@Injectable()
export class ZipService {
    private readonly logger = new Logger(ZipService.name);
    private readonly activeProcesses = new Map<string, Promise<any>>();

    constructor(
        private archiveService: ArchiveService,
        private imgService: ImgService
    ) {
    }

    async processImages(file: Express.Multer.File) {
        const requestId = crypto.randomUUID();

        this.logger.debug(`Starting processing for request ${requestId}, file: ${file.originalname}`);

        try {
            const processingPromise = this.performProcessing(file);
            this.activeProcesses.set(requestId, processingPromise);
            const result = await processingPromise;
            this.logger.debug(`Completed processing for request ${requestId}: processed=${result.processed}, skipped=${result.skipped}`);
            return result;
        } catch (error) {
            this.logger.debug(`[ERROR] processing request ${requestId}:`, error);
            throw error;
        } finally {
            this.activeProcesses.delete(requestId);
            this.logger.debug(`Active processes count: ${this.activeProcesses.size}`);
        }
    }

    private async performProcessing(file: Express.Multer.File) {
        const { id, extractedTo } = await this.archiveService.extract(file);

        return await this.imgService.processThumb(id, extractedTo);
    }
}
