// build.mjs
import { build } from "esbuild";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("build");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: ["dist/main"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  outfile: path.join(outDir, "server.mjs"),

  /* мінімізуємо код і пробіли, але ЗБЕРІГАЄМО ідентифікатори */
  minifySyntax: true,
  minifyWhitespace: true,
  minifyIdentifiers: false,   // без імен змінних/функцій не буде працювати injectionMode: 'CLASSIC'
  treeShaking: true,
  legalComments: "none",
  external: [
    "class-transformer",
    "@nestjs/websockets",
    "@nestjs/websockets",
    "@nestjs/microservices"
  ],
  /* 🪄 додаємо require, module, __dirname, __filename */
  banner: {
    js: `
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
`
  }
});

console.log("✅ ESM bundle → dist/server.mjs");
