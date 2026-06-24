const { spawnSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const parserPath = resolve(__dirname, "../src/parser/parser.js");
const result = spawnSync(
  "peggy",
  [
    "--cache",
    "-o",
    parserPath,
    "--format",
    "umd",
    "--export-var",
    "parser",
    resolve(__dirname, "../src/grammar/niwango.pegjs"),
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const generated = readFileSync(parserPath, "utf8");
const startRuleTruthinessCheck = "  if (options.startRule) {";
const startRulePresenceCheck = '  if ("startRule" in options) {';

if (!generated.includes(startRuleTruthinessCheck)) {
  throw new Error(
    "Peggy startRule validation shape changed; review parser generation.",
  );
}

writeFileSync(
  parserPath,
  generated.replaceAll(startRuleTruthinessCheck, startRulePresenceCheck),
);
