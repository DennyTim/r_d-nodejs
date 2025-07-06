import { GracefulShutdownService } from "./graceful-shutdown.service";
import { SetupParamsModel } from "./models/gs-config.model";

export const setupGracefulShutdown = (params: SetupParamsModel): void => {
    const { app, signals } = params;

    app.enableShutdownHooks(signals);

    app.get(GracefulShutdownService)
        .setupGracefulShutdown(app);
};
