import {
    Injectable,
    Logger
} from "@nestjs/common";
import { Dirent } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { Worker } from "worker_threads";
import { SharedState } from "../models/shared-state.model";
import { SharedMutex } from "../worker/mutex";
import { ArchiveService } from "./archive.service";

@Injectable()
export class ImgService {
    private readonly logger = new Logger(ImgService.name);
    private mutex = new SharedMutex();
    private imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    private state: SharedState = { processed: 0, skipped: 0 };
    private options = {
        width: 150,
        height: 150,
        quality: 80,
        format: "jpeg" as const
    };

    constructor(private archiveService: ArchiveService) {
    }

    async processThumb(id: string, extractedTo: string) {
        this.resetThumbOptions();
        this.resetState();

        const paths = await this.getAllImages(extractedTo);

        if (paths.length === 0) {
            await this.archiveService.clearTmp(id);
            this.logger.log("No images to process");
            return { ...this.state };
        }

        try {
            await this.processAllWorkers(paths);
            await new Promise((r) => setTimeout(r, 300));

            this.logger.log(`All workers completed. Processed: ${this.state.processed}, Skipped: ${this.state.skipped}`);

            await this.archiveService.clearTmp(id);
        } catch (error) {

            this.logger.error("Error during worker processing:", error);
            await this.archiveService.clearTmp(id);
        }

        return { ...this.state };
    }

    private async processAllWorkers(paths: string[]): Promise<void> {
        return new Promise((resolve) => {
            let completedWorkers = 0;
            const totalWorkers = paths.length;
            const workers: Worker[] = [];

            const checkCompletion = () => {
                completedWorkers++;

                if (completedWorkers === totalWorkers) {
                    this.logger.log(`All ${totalWorkers} workers have completed`);
                    resolve();
                }
            };

            paths.forEach((imagePath, index) => {
                const worker = this.createWorker(imagePath, this.options, index, checkCompletion);
                workers.push(worker);
            });

            setTimeout(() => {
                if (completedWorkers < totalWorkers) {
                    this.logger.warn(`Worker timeout: ${completedWorkers}/${totalWorkers} completed`);

                    workers.forEach(worker => {
                        worker.terminate().catch(err =>
                            this.logger.warn("Error terminating worker:", err)
                        );
                    });
                    resolve();
                }
            }, 30000);
        });
    }

    private createWorker(
        imagePath: string,
        options: Record<string, string | number>,
        workerId: number,
        onCompleteCb: () => void
    ) {
        const workerPath = join(__dirname, "..", "worker", "worker.js");

        const worker: Worker = new Worker(workerPath, {
            workerData: {
                imagePath,
                options,
                workerId,
                mutexBuffer: this.mutex.getBuffer()
            }
        } as WorkerOptions);

        let isCompleted = false;

        const markCompleted = () => {
            if (!isCompleted) {
                isCompleted = true;
                onCompleteCb();
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on("message", async (message: { type: string, error: string }): Promise<void> => {
            if (message.type === "success") {
                await this.updateState("processed");

                this.logger.log(`Worker ${workerId}: Successfully processed ${imagePath}`);
            } else if (message.type === "error") {
                await this.updateState("skipped");

                this.logger.error(`Worker ${workerId}: Failed to process ${imagePath} - ${message.error}`);
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on("error", async (error: Error): Promise<void> => {
            await this.updateState("skipped");
            this.logger.error(`Worker ${workerId} error:`, error);
            markCompleted();
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                this.logger.error(`Worker ${workerId} stopped with exit code ${code}`);
            }
            markCompleted();
        });

        return worker;
    }

    private async updateState(field: keyof SharedState): Promise<void> {
        await this.mutex.lock();

        try {
            this.state[field]++;
        } finally {
            this.mutex.unlock();
        }
    }

    private async getAllImages(dir: string): Promise<string[]> {
        const results: string[] = [];
        const entries: Dirent<string>[] = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);

            const isCorrectExt = this.imageExtensions.includes(
                entry.name.toLowerCase().slice(entry.name.lastIndexOf("."))
            );

            if (entry.isFile() && isCorrectExt) {
                results.push(fullPath);
            }
        }

        return results;
    }

    private resetThumbOptions(options?: Record<string, string | number>): void {
        this.options = {
            width: 150,
            height: 150,
            quality: 80,
            format: "jpeg" as const,
            ...options
        };
    }

    private resetState(): void {
        this.state = { processed: 0, skipped: 0 };
    }
}
