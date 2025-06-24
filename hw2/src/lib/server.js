import * as http from "node:http";
import * as url from "node:url";
import { getRoutes } from "./router.js";
import { sendJSON } from "../helpers/send-json.js";
import { generateError } from "../helpers/generate-error.js";
import { METHOD_NOT_ALLOWED, ROUTE_NOT_FOUND } from "../helpers/error-msg.js";

export const server = http.createServer(
  async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const reqPath = parsedUrl.pathname;
    const reqSegments = reqPath.split("/").filter(Boolean);
    const routes = getRoutes();

    for (let i = 0; i < routes.length; i++) {
      const routeSegments = routes[i].path.split("/").filter(Boolean);
      const routeHandler = routes[i].handler;
      const params = {};

      if (routeSegments.length !== reqSegments.length) {
        continue;
      }

      const matched = routeSegments.every((item, index) => {
        if (item.startsWith(":")) {
          const paramName = item.slice(1);
          params[paramName] = reqSegments[index];
          return true;
        }

        return item === reqSegments[index];
      });

      if (matched) {
        req.params = params;

        const method = req.method.toUpperCase();

        if (routeHandler[method]) {
          return routeHandler[method](req, res);
        } else {
          return sendJSON(res, generateError(METHOD_NOT_ALLOWED), 405);
        }
      }
    }

    return sendJSON(res, generateError(ROUTE_NOT_FOUND), 404);
  }
);
