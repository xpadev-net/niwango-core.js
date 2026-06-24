import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workflowsDir = path.join(repoRoot, ".github", "workflows");

const workflowFiles = fs
  .readdirSync(workflowsDir)
  .filter((file) => /\.ya?ml$/u.test(file))
  .sort();

if (workflowFiles.length === 0) {
  throw new Error("No GitHub workflow YAML files found");
}

for (const file of workflowFiles) {
  const filePath = path.join(workflowsDir, file);
  const workflow = parseWorkflow(filePath, file);

  if (!workflow || typeof workflow !== "object") {
    throw new Error(`${file}: workflow must be a YAML mapping`);
  }

  if (typeof workflow.name !== "string" || workflow.name.length === 0) {
    throw new Error(`${file}: workflow must declare a non-empty name`);
  }

  if (!("on" in workflow) && !("true" in workflow)) {
    throw new Error(`${file}: workflow must declare triggers`);
  }

  if (
    !workflow.jobs ||
    typeof workflow.jobs !== "object" ||
    Array.isArray(workflow.jobs)
  ) {
    throw new Error(`${file}: workflow must declare jobs as a mapping`);
  }
}

function parseWorkflow(filePath, file) {
  try {
    const output = execFileSync(
      "ruby",
      [
        "-ryaml",
        "-rjson",
        "-e",
        "data = YAML.load_file(ARGV.fetch(0)); puts JSON.generate(data)",
        filePath,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    return JSON.parse(output);
  } catch (error) {
    const message =
      error.stderr?.toString().trim() || error.message || "unknown error";
    throw new Error(`${file}: ${message}`);
  }
}
