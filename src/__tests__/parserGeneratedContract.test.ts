import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, test } from "vitest";
import {
  SyntaxError as PeggySyntaxError,
  parse,
  StartRules,
} from "@/parser/parser";

const require = createRequire(import.meta.url);
const generatedParser = require("../parser/parser") as {
  StartRules: ["Start"];
  SyntaxError: typeof PeggySyntaxError;
  parse: (
    script: string,
    options?: { grammarSource?: string; startRule?: unknown },
  ) => unknown;
};
const parserDeclarationPath = resolve(__dirname, "../parser/parser.d.ts");

const exportedDeclarationNames = () => {
  const sourceFile = ts.createSourceFile(
    parserDeclarationPath,
    readFileSync(parserDeclarationPath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const names = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (ts.canHaveModifiers(statement)) {
      const hasExportModifier = ts
        .getModifiers(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
      if (hasExportModifier) {
        if (
          ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isEnumDeclaration(statement) ||
          ts.isModuleDeclaration(statement)
        ) {
          if (statement.name) {
            names.add(statement.name.text);
          }
        } else if (ts.isVariableStatement(statement)) {
          for (const declaration of statement.declarationList.declarations) {
            if (ts.isIdentifier(declaration.name)) {
              names.add(declaration.name.text);
            }
          }
        }
      }
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const specifier of statement.exportClause.elements) {
        names.add(specifier.name.text);
      }
    }
  }

  return [...names].sort();
};

describe("generated parser contract", () => {
  test("keeps runtime exports synchronized with parser.d.ts", () => {
    const declaredStartRules: ["Start"] = StartRules;

    expect(exportedDeclarationNames()).toEqual(
      Object.keys(generatedParser).sort(),
    );
    expect(Object.keys(generatedParser).sort()).toEqual([
      "StartRules",
      "SyntaxError",
      "parse",
    ]);
    expect(declaredStartRules).toEqual(["Start"]);
    expect(generatedParser.parse).toEqual(expect.any(Function));
    expect(generatedParser.SyntaxError).toEqual(expect.any(Function));
    expect(generatedParser.SyntaxError.buildMessage).toEqual(
      expect.any(Function),
    );
  });

  test("keeps syntax error declaration synchronized with runtime shape", () => {
    let error: InstanceType<typeof PeggySyntaxError> | undefined;

    try {
      parse("1@+2", { grammarSource: "parser-contract.test" });
    } catch (caught) {
      if (caught instanceof PeggySyntaxError) {
        error = caught;
      } else {
        throw caught;
      }
    }

    if (!error) {
      throw new Error("expected parser syntax error");
    }

    expect(error).toBeInstanceOf(PeggySyntaxError);
    expect(error.name).toBe("SyntaxError");
    expect(error.found).toBe("@");
    expect(error.expected).toEqual(expect.any(Array));
    expect(error.location).toEqual(
      expect.objectContaining({
        source: "parser-contract.test",
        start: expect.objectContaining({ line: 1, column: 2 }),
        end: expect.objectContaining({ line: 1, column: 3 }),
      }),
    );
    expect(
      error.format([{ source: "parser-contract.test", text: "1@+2" }]),
    ).toContain("parser-contract.test:1:2");
    expect(
      PeggySyntaxError.buildMessage(error.expected, error.found),
    ).toContain('"@"');
  });

  test.each(["", null, 0, false])(
    "preserves startRule validation for %s",
    (startRule) => {
      expect(() => generatedParser.parse("1+2", { startRule })).toThrow(
        `Can't start parsing from rule "${startRule}".`,
      );
    },
  );
});
