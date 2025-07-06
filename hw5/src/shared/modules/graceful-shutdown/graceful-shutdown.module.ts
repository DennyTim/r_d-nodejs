import {
    DynamicModule,
    Module
} from "@nestjs/common";
import {
    DEFAULT_CONFIG_OPTIONS,
    GRACEFUL_SHUTDOWN_OPTIONS
} from "./constants/gs-options.constant";
import { GracefulShutdownService } from "./graceful-shutdown.service";
import { GracefulShutdownConfig } from "./models/gs-config.model";

@Module({})
export class GracefulShutdownModule {
    static forRoot(options?: GracefulShutdownConfig): DynamicModule {
        return {
            module: GracefulShutdownModule,
            providers: [
                {
                    provide: GRACEFUL_SHUTDOWN_OPTIONS,
                    useValue: options ?? DEFAULT_CONFIG_OPTIONS
                },
                GracefulShutdownService
            ]
        };
    }
}
