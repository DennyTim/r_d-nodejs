import swaggerJSDoc from "swagger-jsdoc";
import { config } from "../../config/index.js";

export const jsdocSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: config.appName, version: config.appVersion }
  },
  apis: ["./src/app/routes/**/*.js"] // JSDoc-коментарі у роутерах
});
