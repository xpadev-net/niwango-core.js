import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

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
  const source = fs.readFileSync(filePath, "utf8");
  const document = parseDocument(source, { prettyErrors: true });

  if (document.errors.length > 0) {
    const errors = document.errors
      .map((error) => `${file}: ${error.message}`)
      .join("\n");
    throw new Error(errors);
  }

  const workflow = document.toJSON();

  if (!workflow || typeof workflow !== "object") {
    throw new Error(`${file}: workflow must be a YAML mapping`);
  }

  if (typeof workflow.name !== "string" || workflow.name.length === 0) {
    throw new Error(`${file}: workflow must declare a non-empty name`);
  }

  if (!("on" in workflow)) {
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
