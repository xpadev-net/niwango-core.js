import { describe, expect, test } from "vitest";
import type {
  A_ANY,
  A_ArrayExpression,
  A_ConditionalExpression,
  A_LambdaExpression,
  A_Literal,
  A_ParsedLambdaExpression,
  A_Program,
} from "@/@types/ast";
import { parse } from "@/parser/parser";

const asAst = (node: A_ANY) => node;

describe("AST type declarations", () => {
  test("allow runtime nil literals to carry undefined", () => {
    const literal: A_Literal = { type: "Literal", value: undefined };

    expect(literal.value).toBeUndefined();
  });

  test("allow parsed lambdas before runtime scopes are attached", () => {
    const parsedLambda: A_ParsedLambdaExpression = {
      type: "LambdaExpression",
      body: { type: "BlockStatement", body: [] },
    };
    const runtimeLambda: A_LambdaExpression = {
      ...parsedLambda,
      scopes: [],
    };

    expect(parsedLambda.scopes).toBeUndefined();
    expect(runtimeLambda.scopes).toEqual([]);
  });

  test("keeps conditional expressions in the general AST union", () => {
    const conditional: A_ConditionalExpression = {
      type: "ConditionalExpression",
      test: { type: "Literal", value: true },
      consequent: { type: "Literal", value: 1 },
      alternate: { type: "Literal", value: 2 },
    };

    expect(asAst(conditional)).toBe(conditional);
  });

  test("allows parser-emitted null elements for array elision", () => {
    const array: A_ArrayExpression = {
      type: "ArrayExpression",
      elements: [null, { type: "Literal", value: 1 }],
    };

    expect(array.elements[0]).toBeNull();
  });
});

describe("parser AST shapes covered by declarations", () => {
  test("parses lambdas without runtime-only scopes", () => {
    const ast = parse("x=\\(1)") as A_Program;
    const statement = ast.body[0];

    expect(statement?.type).toBe("ExpressionStatement");
    if (statement?.type !== "ExpressionStatement") {
      throw new Error("expected expression statement");
    }

    const expression = statement.expression;
    expect(expression.type).toBe("AssignmentExpression");
    if (expression.type !== "AssignmentExpression") {
      throw new Error("expected assignment expression");
    }

    expect(expression.right.type).toBe("LambdaExpression");
    expect(expression.right).not.toHaveProperty("scopes");
  });

  test("parses array elision as null elements", () => {
    const ast = parse("[,1,,2,]") as A_Program;
    const statement = ast.body[0];

    expect(statement?.type).toBe("ExpressionStatement");
    if (statement?.type !== "ExpressionStatement") {
      throw new Error("expected expression statement");
    }

    const expression = statement.expression;
    expect(expression.type).toBe("ArrayExpression");
    if (expression.type !== "ArrayExpression") {
      throw new Error("expected array expression");
    }

    expect(expression.elements).toEqual([
      null,
      expect.objectContaining({ type: "Literal", value: 1 }),
      null,
      expect.objectContaining({ type: "Literal", value: 2 }),
    ]);
  });
});
