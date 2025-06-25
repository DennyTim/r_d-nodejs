import toJSON from "./to-json.js";

const routes = [];

export const addRoute = (method, path, handler) => {
  const segments = path.split("/").filter(Boolean);
  routes.push({ method: method.toUpperCase(), segments, handler });
};

export const requestHandler = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const reqSegments = parsedUrl.pathname.split("/").filter(Boolean);

  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  for (const route of routes) {
    if (route.method !== req.method) {
      continue;
    }
    if (route.segments.length !== reqSegments.length) {
      continue;
    }

    const params = {};

    const matched = route.segments.every((segment, i) => {
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1);
        params[paramName] = reqSegments[i];
        return true;
      }
      return segment === reqSegments[i];
    });

    if (matched) {
      req.params = params;
      return route.handler(req, res);
    }
  }

  return toJSON(res, { error: "Not Found" }, 404);
};
