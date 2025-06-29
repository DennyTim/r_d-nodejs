import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

/* додаємо .openapi() у всі Zod-схеми */
extendZodWithOpenApi(z);

/**
 * Глобальний singleton, щоб будь-який файл міг «дозареєструвати»
 * DTO або path — і все опиниться в одній OpenAPI-специфікації.
 */
globalThis.registry ??= new OpenAPIRegistry();

export const registry = globalThis.registry;
