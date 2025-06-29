import "dotenv/config";
import pkg from "../../package.json" assert { type: "json" }; // Import version from package.json
import { z } from "zod";

const DEFAULT_PORT = 3000;
const DEFAULT_ENV = "development";

const numberStringSchema = (def) => z.coerce.number().default(def).transform(String);

const schema = z.object({
  PORT: numberStringSchema(DEFAULT_PORT),
  NODE_ENV: z.enum(["development", "production", "test"]).default(DEFAULT_ENV)
});

const parsed = schema.parse(process.env);

export const config = {
  port: parsed.PORT,
  env: parsed.NODE_ENV,
  baseUrl: `http://localhost:${parsed.PORT}`,
  appName: "Coffee Brew Log Express API",
  appVersion: pkg.version
};
