import { Injectable } from "@nestjs/common";
import {
    mkdir,
    rm,
    writeFile
} from "fs/promises";
import {
    join,
    resolve
} from "path";
import { execAsync } from "../utils/exec-async";

@Injectable()
export class ArchiveService {
    private readonly baseTempDir = resolve("public");
    private readonly tmpDir = "tmp";

    async extract(file: Express.Multer.File): Promise<{ id: string; extractedTo: string }> {
        const id = crypto.randomUUID();
        const archiveDir = join(this.baseTempDir, this.tmpDir, id);
        const extractTo = join(archiveDir, "unzipped");
        const archivePath = join(archiveDir, file.originalname);

        await mkdir(extractTo, { recursive: true });
        await writeFile(archivePath, file.buffer);

        try {
            if (file.originalname.endsWith(".zip") && process.platform !== "win32") {
                await execAsync(`unzip -qq "${archivePath}" -d "${extractTo}"`);
            } else if (file.originalname.endsWith(".zip") && process.platform === "win32") {
                await execAsync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${extractTo}' -Force"`);
            } else {
                throw new Error("Incorrect file extension");
            }
            return { id: id, extractedTo: extractTo };
        } catch (error) {
            await rm(archiveDir, { recursive: true });

            const errorMessage = error instanceof Error ? error.message : String(error);

            throw new Error(`[ArchiveService] Extraction failed: ${errorMessage}`);
        }
    }

    async clearTmp(id: string): Promise<void> {
        try {
            const archiveDir = join(this.baseTempDir, this.tmpDir, id);
            await rm(archiveDir, { recursive: true, force: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            console.error(`[ArchiveService] Failed to clear temp directory: ${errorMessage}`);
        }
    }
}
