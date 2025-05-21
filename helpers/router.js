const routes = [];

export const addRoute = (method, path, handler) => {
  const segments = path.split("/").filter(Boolean);
  routes.push({ method: method.toUpperCase(), segments, handler });
};

export const requestHandler = (req, res) => {
  const [path] = req.url.split("?");
  const reqSegments = path.split("/").filter(Boolean);

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

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: 'Not Found' }));
};
