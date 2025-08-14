import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: "json" };

import * as path from "node:path";
import { fileURLToPath } from "node:url";

const banner = `/*!
  niwango-core.js v${pkg.version}
  (c) 2023 xpadev-net https://xpadev.net
  Released under the ${pkg.license} License.
*/`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "src/main.ts",
  output: {
    file: "dist/niwango-core.js",
    format: "umd",
    name: "NiwangoCore",
    banner,
  },
  plugins: [
    json(),
    typescript(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      configFile: path.resolve(__dirname, ".babelrc.js"),
    }),
    nodeResolve(),
  ],
};
