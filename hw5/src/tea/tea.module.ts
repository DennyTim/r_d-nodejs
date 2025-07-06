import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { GracefulShutdownModule } from "../shared/modules/graceful-shutdown/graceful-shutdown.module";
import { TeaController } from "./tea.controller";
import { TeaService } from "./tea.service";

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,
                    limit: 10
                }
            ]
        }),
        GracefulShutdownModule.forRoot({
            keepNodeProcessAlive: false,
            gracefulShutdownTimeout: 1000,
            cleanup: (app) => {
                const teaService = app.get(TeaService);
                teaService.clearMap();
            }
        })
    ],
    controllers: [TeaController],
    providers: [TeaService]
})
export class TeaModule {
}
