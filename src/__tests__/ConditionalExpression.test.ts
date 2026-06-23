import { describe, expect, test } from "vitest";
import type { A_ANY } from "@/@types/ast";
import { prototypeScope } from "@/context";
import { NotImplementedError } from "@/errors";
import NiwangoCore from "@/main";
import { run } from "@/testUtils";

describe("ConditionalExpression", () => {
  test("evaluates the consequent when test is truthy", () => {
    expect(run("true ? 1 : 2")).toBe(1);
  });

  test("evaluates the alternate when test is falsy", () => {
    expect(run("false ? 1 : 2")).toBe(2);
  });

  test("does not evaluate an unselected alternate", () => {
    expect(run("i=0; true ? 1 : (i=1); i")).toBe(0);
    expect(run("true ? 1 : notImplemented()")).toBe(1);
  });

  test("does not evaluate an unselected consequent", () => {
    expect(run("i=0; false ? (i=1) : 2; i")).toBe(0);
    expect(run("false ? notImplemented() : 2")).toBe(2);
  });

  test("throws for unsupported AST node types when strict execution is used", () => {
    const ast = { type: "UnsupportedExpression" } as unknown as A_ANY;

    expect(() =>
      NiwangoCore.execute(ast, [{}, {}, prototypeScope], [ast], {}),
    ).toThrow(NotImplementedError);
  });
});
