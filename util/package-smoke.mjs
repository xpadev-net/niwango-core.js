import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
);

const requiredPackageFiles = [pkg.main, pkg.types];

for (const file of requiredPackageFiles) {
  if (typeof file !== "string" || file.length === 0) {
    throw new Error("package.json must declare main and types entries");
  }

  if (!fs.existsSync(path.join(repoRoot, file))) {
    throw new Error(`Missing built package entry: ${file}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "niwango-package-"));
const consumerDir = path.join(tempRoot, "consumer");

const run = (command, args, options = {}) => {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  });
};

try {
  const packOutput = execFileSync(
    "npm",
    ["pack", "--json", "--pack-destination", tempRoot, "--ignore-scripts"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const [packInfo] = JSON.parse(packOutput);
  const packedFiles = new Set(packInfo.files.map((file) => file.path));

  for (const file of requiredPackageFiles) {
    if (!packedFiles.has(file)) {
      throw new Error(`Packed package is missing ${file}`);
    }
  }

  fs.mkdirSync(consumerDir);
  fs.writeFileSync(
    path.join(consumerDir, "package.json"),
    JSON.stringify({ private: true, type: "commonjs" }, null, 2),
  );

  const tarball = path.join(tempRoot, packInfo.filename);
  run(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    {
      cwd: consumerDir,
    },
  );

  fs.writeFileSync(
    path.join(consumerDir, "require-smoke.cjs"),
    `
const exported = require(${JSON.stringify(pkg.name)});
const NiwangoCore = exported.default ?? exported;

if (typeof NiwangoCore.execute !== "function") {
  throw new Error("Package main does not expose execute()");
}

if (typeof NiwangoCore.parse !== "function") {
  throw new Error("Package main does not expose parse()");
}

NiwangoCore.parse("1 + 1;");
`,
  );
  run("node", ["require-smoke.cjs"], { cwd: consumerDir });

  fs.writeFileSync(
    path.join(consumerDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
          skipLibCheck: false,
        },
        include: ["type-smoke.ts"],
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(consumerDir, "type-smoke.ts"),
    `
import NiwangoCore from ${JSON.stringify(pkg.name)};
import type { A_Program, Execute } from ${JSON.stringify(pkg.name)};

const parse: typeof NiwangoCore.parse = NiwangoCore.parse;
const execute: typeof NiwangoCore.execute = NiwangoCore.execute;
const typedExecute: Execute = execute;
const program: A_Program = { type: "Program", body: [] };

const ast = parse("1 + 1;");
void ast;
void program;
void typedExecute;
`,
  );
  run(
    path.join(repoRoot, "node_modules", ".bin", "tsc"),
    ["--noEmit", "--project", "tsconfig.json"],
    {
      cwd: consumerDir,
    },
  );
} finally {
  if (process.env.KEEP_PACKAGE_SMOKE !== "1") {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  } else {
    console.log(`Kept package smoke temp dir: ${tempRoot}`);
  }
}
