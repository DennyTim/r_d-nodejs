import {
    BeforeApplicationShutdown,
    INestApplication,
    Inject,
    Injectable,
    OnApplicationShutdown
} from "@nestjs/common";
import { execSync } from "child_process";
import {
    createHttpTerminator,
    HttpTerminator
} from "http-terminator";
import { Server } from "https";
import * as os from "node:os";
import {
    DEFAULT_CONFIG_OPTIONS,
    GRACEFUL_SHUTDOWN_OPTIONS
} from "./constants/gs-options.constant";
import { GracefulShutdownConfig } from "./models/gs-config.model";

@Injectable()
export class GracefulShutdownService implements BeforeApplicationShutdown, OnApplicationShutdown {

    private httpTermination: HttpTerminator | null = null;
    private app: INestApplication | null = null;

    constructor(
        @Inject(GRACEFUL_SHUTDOWN_OPTIONS)
        private options: GracefulShutdownConfig
    ) {
        this.options = { ...DEFAULT_CONFIG_OPTIONS, ...options };

        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception", error);
            void this.cleanupAndExit(1);
        });

        process.on("unhandledRejection", (reason) => {
            console.error("Unhandled Rejection", reason as any);
            void this.cleanupAndExit(1);
        });

        if (!this.options.keepNodeProcessAlive) {
            process.on("SIGTERM", () => void this.cleanupAndExit(0, "SIGTERM"));
            process.on("SIGINT", () => void this.cleanupAndExit(0, "SIGINT"));
        }
    }

    async beforeApplicationShutdown() {
        if (!this.httpTermination) {
            throw new Error("You have to invoke `setupGracefulShutdown({ app })`");
        }

        await this.httpTermination.terminate();
    }

    async onApplicationShutdown(signal?: string) {
        if (!this.httpTermination) {
            throw new Error("You have to invoke `setupGracefulShutdown({ app })`");
        }
        try {
            await this.options.cleanup?.(this.app!, signal);
        } catch (error) {
            console.error("Error during cleanup", error);
            if (!this.options.keepNodeProcessAlive) {
                process.exit(1);
            }
        }

        if (signal && !this.options.keepNodeProcessAlive) {
            const port = 3000;
            const currentPid = process.pid.toString();

            try {
                const platform = os.platform();

                if (platform === "win32") {

                    const output = execSync(`netstat -ano | findstr :${port}`)
                        .toString()
                        .split("\n")
                        .filter(Boolean);

                    for (const line of output) {
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[parts.length - 1];

                        if (pid && pid !== currentPid) {
                            console.log(`🛑 Killing process on port ${port} (PID: ${pid})...`);
                            execSync(`taskkill /PID ${pid} /F`);
                            console.log(`✅ Port ${port} is now free.`);
                            break;
                        }
                    }
                } else {
                    const pid = execSync(`lsof -t -i:${port}`).toString().trim();
                    if (pid && pid !== currentPid) {
                        console.log(`🛑 Killing process on port ${port} (PID: ${pid})...`);
                        execSync(`kill -9 ${pid}`);
                        console.log(`✅ Port ${port} is now free.`);
                    }
                }
            } catch {
                console.error("Port is free or exception occur with access rights");
            }

            process.exit(0);
        }

        if (signal && this.options.keepNodeProcessAlive) {
            this.skipShutdownSignal(signal);
        }
    }

    public setupGracefulShutdown(app: INestApplication): void {
        this.app = app;

        this.httpTermination = createHttpTerminator({
            gracefulTerminationTimeout: this.options.gracefulShutdownTimeout,
            server: app.getHttpServer() as Server
        });
    }

    public async cleanupAndExit(code: number, signal?: string) {
        console.warn(`Force shutdown with code ${code}`);

        try {
            await this.onApplicationShutdown(signal);
        } finally {
            process.exit(code);
        }
    }

    private skipShutdownSignal(signal: string) {
        const skipSignal = (): void => {
            process.removeListener(signal, skipSignal);
        };

        process.on(signal, skipSignal);
    }
}
