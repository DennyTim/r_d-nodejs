import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../../config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const staticRoot = config.env === "production" ?
  path.resolve(__dirname, "dist")
  : path.resolve(__dirname, "..", "..", "dist");

export function attachStaticHandler(app) {
  /**
   * Віддаємо статику /build/*
   * • у DEV – кешування вимкнене
   * • у PROD – кеш браузера 7 днів
   */
  app.use(
    express.static(staticRoot, {
      index: false, // щоб не перетинатись із fallback
      maxAge: config.env === "production" ? "7d" : 0
    })
  );

  /**
   * Fallback «*» (для React-Router History API)
   * • усе, що не починається з /api або /docs,
   *  повертає index.html, а вже SPA вирішує, який компонент
   *  показати (/, /about, /dashboard/42 …)
   */
  app.get("*path", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/docs")) {
      return next();
    }
    res.sendFile(path.join(staticRoot, "index.html"));
  });
}
