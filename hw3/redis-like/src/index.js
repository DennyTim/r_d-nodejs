import * as http from "node:http";
import { initRoutes } from "./controller/controller.js";
import * as router from "./helpers/request-handler.js";

initRoutes();

const server = http.createServer((req, res) =>
  router.requestHandler(req, res)
);

server.listen(
  process.env.PORT,
  () => console.log(`Redis Server started on port ${process.env.PORT}`)
);
