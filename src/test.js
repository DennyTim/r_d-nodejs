import * as assert from "node:assert";
import { after, before, describe, test } from "node:test";
import { server } from "./lib/server.js";
import { routesScanner } from "./lib/router.js";
import url from "node:url";
import path from "node:path";
import { Service } from "./services/users.service.js";

describe("HTTP Server Tests", () => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const ROUTES_DIR = path.join(__dirname, "routes");
  let httpServer;
  let userId;

  before(async () => {
    await routesScanner(ROUTES_DIR, "");

    httpServer = await new Promise(resolve => {
      server.listen(process.env.PORT, () => {
        resolve(server);
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      httpServer.close(() => {
        Service.deleteUser(userId);
        resolve();
      });
    });
  });

  test(`should return "test" for GET http:/localhost:${process.env.PORT}/`, async () => {
    const response = await fetch(`http://localhost:${process.env.PORT}/`);
    const data = await response.text();

    assert.strictEqual(response.status, 200, "Expected status code 200");
    assert.strictEqual(data, "test", "Expected correct response body");
  });

  test("should return \"Not Found\" for unknown routes", async () => {
    const response = await fetch(`http://localhost:${process.env.PORT}/unknown`);
    const data = await response.text();

    assert.strictEqual(response.status, 404, "Expected status code 404");
    assert.strictEqual(data, "Not Found", "Not Found");
  });

  test("should return \"{ name: \"John Doe\", age: 30, role: \"user\" }\" for /POST Create User", async () => {
    const payload = { name: "John Doe", age: 30, role: "user" };

    const response = await fetch(`http://localhost:${process.env.PORT}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const { data: { id, name, age, role } } = await response.json();

    userId = id;

    assert.equal(response.status, 201, "Expected status code 201");
    assert.deepEqual({ name, age, role }, payload, "Expected data  name: \"John Doe\", age: 30, role: \"user\" }");
  });
});
