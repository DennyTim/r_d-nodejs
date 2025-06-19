import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export const routes = [];

export const routesScanner = async (directory, base) => {
  if (!fs.existsSync(directory)) {
    console.error(`Directory not found: ${directory}`);
    return;
  }

  const endpoints = fs.readdirSync(directory, { withFileTypes: true });
  const eLength = endpoints.length;

  for (let i = 0; i < eLength; i++) {
    const endpointPath = path.join(directory, endpoints[i].name);

    if (endpoints[i].isDirectory()) {
      let segment;

      if (endpoints[i].name.startsWith("[") && endpoints[i].name.endsWith("]")) {
        segment = `:${endpoints[i].name.slice(1, -1)}`;
      } else {
        segment = endpoints[i].name;
      }

      await routesScanner(endpointPath, path.join(base, segment));
    }

    if (endpoints[i].isFile() && endpoints[i].name) {
      const handlerModule = await import(pathToFileURL(endpointPath));
      const handler = handlerModule.default;

      routes.push({ path: "/" + base.split(path.sep).filter(Boolean).join(), handler });
    }
  }
};
