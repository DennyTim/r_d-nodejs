import * as router from "../helpers/request-handler.js";
import Service from "../services/service.js";
import toJSON from "../helpers/to-json.js";
import bodyParse from "../helpers/parse-body.js";

export const initRoutes = () => {
  router.addRoute("GET", "/get", (req, res) => {
    const { key } = req.query;
    const value = Service.has(key) ? Service.get(key) : null;

    return toJSON(res, { value }, 200);
  });

  router.addRoute("POST", "/set", (req, res) => {
    return bodyParse(req, ({ key, value }) => {
      Service.set(key, value);

      return toJSON(res, { ok: true }, 200);
    });
  });
};
