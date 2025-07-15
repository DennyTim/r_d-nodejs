import { z } from "zod";

export const configSchema = z.object({
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["info", "warn", "error"]).default("info")
});

export type AppConfig = z.infer<typeof configSchema>;
