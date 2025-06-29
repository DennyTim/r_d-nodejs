import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";

export default defineConfig([
  {
    files: ["**/*.js"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        ecmaVersion: 2022,
        deprecatedImportAssert: true,
      },
      ecmaVersion: 2022,
      globals: {
        ...globals.node                 // Buffer, __dirname, require, process …
      }
    },
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "semi": ["error", "always"],      // вимагаємо ;
      "quotes": ["error", "double"],    // одинарні лапки
      "no-console": "warn"              // console.log лише за попередженням
    }
  }
]);
