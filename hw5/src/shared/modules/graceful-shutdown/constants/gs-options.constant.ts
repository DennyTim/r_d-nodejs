import { GracefulShutdownConfig } from "../models/gs-config.model";

export const GRACEFUL_SHUTDOWN_OPTIONS =
    "GRACEFUL_SHUTDOWN_OPTIONS";

export const DEFAULT_CONFIG_OPTIONS: GracefulShutdownConfig = {
    cleanup: async () => {},
    gracefulShutdownTimeout: 5000,
    keepNodeProcessAlive: false,
};
