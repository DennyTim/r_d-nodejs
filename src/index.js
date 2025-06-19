import { fileURLToPath } from "node:url";
import { routes, routesScanner } from "./lib/router.js";
import * as path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROUTES_DIR = path.join(__dirname, "routes");

(async function init() {
  await routesScanner(ROUTES_DIR, "");

  console.log(routes);
})();


