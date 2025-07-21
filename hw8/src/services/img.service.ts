import {
    HttpException,
    HttpStatus,
    Injectable
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
    private imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
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

        const mutex = new SharedMutex();
        const state: SharedState = { processed: 0, skipped: 0 };

        const paths = await this.getAllImages(extractedTo);

        if (paths.length === 0) {
            await this.archiveService.clearTmp(id);
            return state;
        }

        try {
            const finalState: SharedState = await this.processAllWorkers(paths, id, mutex, state);
            await new Promise((r) => setTimeout(r, 300));
            const total = finalState.processed + finalState.skipped;

            if (total !== paths.length) {
                return Promise.reject(
                    new HttpException(`Integrity check failed for ${id}: processed(${finalState.processed}) + skipped(${finalState.skipped}) = ${total}, expected ${paths.length}`, HttpStatus.BAD_REQUEST)
                );
            }

            await this.archiveService.clearTmp(id);

            return finalState;
        } catch (error) {
            await this.archiveService.clearTmp(id);

            throw error;
        }
    }

    private async processAllWorkers(
        paths: string[],
        requestId: string,
        mutex: SharedMutex,
        state: SharedState
    ): Promise<SharedState> {
        return new Promise((resolve: (value: SharedState | PromiseLike<SharedState>) => void, reject) => {
            let completedWorkers = 0;
            const totalWorkers = paths.length;
            const workers: Worker[] = [];
            let isResolved = false;

            const safeResolve = (finalState: SharedState) => {
                if (!isResolved) {
                    isResolved = true;

                    workers.forEach(worker => {
                        worker.terminate().catch(err =>
                            reject(new Error(`Error terminating worker: ${err}`))
                        );
                    });

                    resolve(finalState);
                }
            };

            const safeReject = (error: Error) => {
                if (!isResolved) {
                    isResolved = true;

                    workers.forEach(worker => {
                        worker.terminate().catch(err =>
                            reject(new Error(`Error terminating worker: ${err}`))
                        );
                    });
                    reject(error);
                }
            };

            const checkCompletion = async () => {
                completedWorkers++;

                if (completedWorkers === totalWorkers) {
                    await mutex.lock();
                    const finalState = { ...state };
                    mutex.unlock();

                    safeResolve(finalState);
                }
            };

            paths.forEach((imagePath, index) => {
                try {
                    const worker = this.createWorker(
                        imagePath,
                        this.options,
                        index,
                        requestId,
                        mutex,
                        state,
                        checkCompletion,
                        safeReject
                    );
                    workers.push(worker);

                } catch (error) {
                    safeReject(error instanceof Error ? error : new Error(String(error)));
                    return;
                }
            });

            const timeout = setTimeout(() => {
                if (!isResolved) {
                    mutex
                        .lock()
                        .then(() => {
                            const finalState = { ...state };
                            mutex.unlock();
                            safeResolve(finalState);
                        })
                        .catch(err => {
                            safeReject(new Error(`Timeout with mutex error: ${err}`));
                        });
                }
            }, 60000);

            const originalResolve = resolve;

            resolve = (value: SharedState) => {
                clearTimeout(timeout);
                originalResolve(value);
            };
        });
    }

    private createWorker(
        imagePath: string,
        options: Record<string, string | number>,
        workerId: number,
        requestId: string,
        mutex: SharedMutex,
        state: SharedState,
        onCompleteCb: () => Promise<void>,
        safeReject: (error: Error) => void
    ) {
        const workerPath = join(__dirname, "..", "worker", "worker.js");
        const workerPayload = {
            workerData: { imagePath, options, workerId, requestId, mutexBuffer: mutex.getBuffer() }
        } as WorkerOptions;
        const worker: Worker = new Worker(workerPath, workerPayload);

        let isCompleted = false;

        const markCompleted = async () => {
            if (!isCompleted) {
                isCompleted = true;
                await onCompleteCb();
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on("message", this.onWorkerMessage(mutex, state, safeReject));
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on("error", this.onWorkerError(mutex, state, markCompleted, safeReject));
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on("exit", this.onWorkerExit(workerId, markCompleted, safeReject));

        return worker;
    }

    private async updateState(
        state: SharedState,
        mutex: SharedMutex,
        field: keyof SharedState
    ): Promise<void> {
        await mutex.lock();
        try {
            state[field]++;
        } finally {
            mutex.unlock();
        }
    }

    private async getAllImages(dir: string): Promise<string[]> {
        const results: string[] = [];

        try {
            const entries: Dirent[] = await readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = join(dir, entry.name);

                if (entry.isFile()) {
                    const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf("."));
                    if (this.imageExtensions.includes(ext)) {
                        results.push(fullPath);
                    }
                }
            }
        } catch (error) {
            throw new HttpException(`Failed to read images from directory: ${error}`, HttpStatus.BAD_REQUEST);
        }
        return results;
    }


    private onWorkerMessage(
        mutex: SharedMutex,
        state: SharedState,
        safeReject: (error: Error) => void
    ) {
        return async (message: { type: string; }): Promise<void> => {
            try {
                if (message.type === "success") {
                    await this.updateState(state, mutex, "processed");

                } else if (message.type === "error") {
                    await this.updateState(state, mutex, "skipped");
                }
            } catch (error) {
                safeReject(new Error(`Error handling worker message: ${error}`));
            }
        };
    }

    private onWorkerError(
        mutex: SharedMutex,
        state: SharedState,
        markCompleted: () => Promise<void>,
        safeReject: (error: Error) => void
    ) {
        return async (error: Record<string, any>) => {
            safeReject(new Error(`Worker ${error.workerId} error: ${error.error}`));
            try {
                await this.updateState(state, mutex, "skipped");
            } catch (updateError) {
                safeReject(new Error(`Error updating state on worker error: ${updateError}`));
            }
            await markCompleted();
        };
    }

    private onWorkerExit(
        workerId: number,
        markCompleted: () => Promise<void>,
        safeReject: (error: Error) => void
    ) {
        return async (code: any) => {
            if (code !== 0) {
                safeReject(new Error(`Worker ${workerId} exited with code ${code}`));
            }

            await markCompleted();
        };
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
}
