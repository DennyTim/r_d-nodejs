import http from "http";
import * as router from "./helpers/router.js";
import { initRoutes } from "./layers/controller.js";
import { PORT } from "./config/config.js";

initRoutes();

const server = http.createServer(
  (req, res) => router.requestHandler(req, res)
);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

