// build.mjs
import { build } from "esbuild";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("dist");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: ["src/server.js"],
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

  /* 🪄 додаємо require, module, __dirname, __filename */
  banner: {
    js: `
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
`
  }
});

console.log("✅ ESM bundle → dist/server.mjs");
