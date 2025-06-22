import * as url from "node:url";
import * as path from "node:path";
import { routesScanner } from "./lib/router.js";
import { server } from "./lib/server.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROUTES_DIR = path.join(__dirname, "routes");

(async function init() {
  await routesScanner(ROUTES_DIR, "");

  server.listen(
    process.env.PORT,
    () => console.log(`Server is starting on http://localhost:${process.env.PORT}`)
  );
})();


