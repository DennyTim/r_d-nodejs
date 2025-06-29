import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { config } from "../../config/index.js";
import { registry } from "../open-api/registry.js";

export const createZodSpec = () => {

  const zodSpec = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    info: {
      title: config.appName,
      version: config.appVersion
    }
  });

  zodSpec.paths = { ...zodSpec.paths };
  zodSpec.components = {
    ...zodSpec.components,
    schemas: { ...zodSpec.components.schemas }
  };

  return zodSpec;
};
