import * as path from "node:path";
import { fileURLToPath } from "node:url";
import dts from "rollup-plugin-dts";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import pkg from "./package.json" with { type: "json" };

const _banner = `/*!
  niwango-core.js v${pkg.version}
  (c) 2023 xpadev-net https://xpadev.net
  Released under the ${pkg.license} License.
*/`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "./dist/dts/main.d.ts",
  output: [{ file: "dist/niwango-core.d.ts", format: "es" }],
  plugins: [typescriptPaths(), dts()],
};
