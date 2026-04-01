import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
  input: { "niwango-core": "src/main.ts" },
  plugins: [dts({ emitDtsOnly: true })],
  output: {
    dir: "dist",
    format: "es",
  },
});
