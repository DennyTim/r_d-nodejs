import * as dotenv from "dotenv";
import {
    Module,
    Token
} from "../../../core";
import {
    AppConfig,
    configSchema
} from "./config.schema";

// @ts-ignore
export const CONFIG_TOKEN: Token<AppConfig> = Symbol("CONFIG_TOKEN");

@Module({})
export class ConfigModule {
    static forRoot() {
        dotenv.config();

        const parsed = configSchema.safeParse(process.env);

        if (!parsed.success) {
            console.error("Invalid .env config:", parsed.error);
            process.exit(1);
        }

        const validatedConfig = parsed.data;

        return {
            module: ConfigModule,
            providers: [
                {
                    provide: CONFIG_TOKEN,
                    useValue: validatedConfig
                }
            ],
            exports: [CONFIG_TOKEN]
        };
    }
}
