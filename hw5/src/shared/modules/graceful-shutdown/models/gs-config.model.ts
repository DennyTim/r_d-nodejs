import {
    INestApplication,
    ShutdownSignal
} from "@nestjs/common";

export interface GracefulShutdownConfig {
    /**
     * Cleanup function for releasing application resources
     * during server shutdown.
     */
    cleanup?: (app: INestApplication, signal?: string) => any;
    /**
     * The duration in milliseconds before forcefully
     * terminating a connection.
     * Defaults: 5000 (5 seconds).
     */
    gracefulShutdownTimeout?: number;
    /**
     * If set to `true`, the Node process will not be terminated
     * by a shutdown signal after closing all connections.
     * The shutdown behavior is identical to invoking `app.close()`.
     * Defaults: false.
     */
    keepNodeProcessAlive?: boolean;
}

export interface SetupParamsModel {
    /**
     * NestJS application.
     */
    app: INestApplication;
    /**
     * Shutdown signals that the application should listen to.
     * By default, it listens to all ShutdownSignals.
     */
    signals?: ShutdownSignal[] | string[];
}
