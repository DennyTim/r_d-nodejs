import { mergeSpecs } from "./merge-specs.js";
import { jsdocSpec } from "./swagger.js";
import { createZodSpec } from "./open-api.js";

export const generateSpecs = () => {
  return mergeSpecs(jsdocSpec, createZodSpec());
}
