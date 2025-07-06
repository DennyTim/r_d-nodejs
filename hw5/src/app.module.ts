import {
    Logger,
    Module
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import getConfig from "./config/configuration";
import { TeaModule } from "./tea/tea.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [getConfig]
        }),
        TeaModule
    ],
    providers: [Logger]
})
export class AppModule {
}
