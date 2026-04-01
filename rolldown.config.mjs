import { defineConfig } from "rolldown";
import pkg from "./package.json" with { type: "json" };

const banner = `/*!
  niwango-core.js v${pkg.version}
  (c) 2023 xpadev-net https://xpadev.net
  Released under the ${pkg.license} License.
*/`;

export default defineConfig({
  input: "src/main.ts",
  output: {
    file: "dist/niwango-core.js",
    format: "umd",
    name: "NiwangoCore",
    banner,
  },
});
