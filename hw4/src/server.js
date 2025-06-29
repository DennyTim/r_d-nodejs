import http from "node:http";
import { createApp } from "./app/app.js";
import { config } from "./config/index.js";
import { toCapitalize } from "./utils/to-capitalize.js";
import { brewContainer } from "./app/containers/brew.container.js";

const app = createApp();
const server = http.createServer(app);

server.listen(config.port, () =>
  console.log(`🚀 ${toCapitalize(config.env)} API ready on http://localhost:${config.port}`)
);

/**
 * === Graceful shutdown ===
 * */
const shutdown = async () => {
  console.log("🔄 Shutting down gracefully...");

  try {
    await new Promise((resolve, reject) => {
      server.close(async (err) => {
        if (err) {
          return reject(err);
        }

        if (brewContainer.dispose) {
          await brewContainer.dispose();
          console.log("✅  Container disposed");
        }

        console.log("✅  Closed out remaining connections");
        process.exit(0);

        resolve();
      });
    });

    // Якщо через 10 сек не закрився — kill
    const timer = setTimeout(() =>
        process.exit(1),
      10_000
    );

    timer.unref();

  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
