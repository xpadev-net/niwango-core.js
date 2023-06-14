import { A_ANY, A_AssignmentExpression, T_scope } from "@/@types/ast";
import { assign } from "@/context";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import {
  Addition,
  BitwiseAND,
  BitwiseOR,
  BitwiseXOR,
  Division,
  Exponentiation,
  LeftShift,
  Multiplication,
  Remainder,
  RightShift,
  Subtraction,
  UnsignedRightShift,
} from "@/operators";

/**
 * 演算子と処理の対応表
 */
const processors = {
  "=": (_: unknown, right: unknown) => right,
  "+=": Addition,
  "-=": Subtraction,
  "*=": Multiplication,
  "/=": Division,
  "%=": Remainder,
  "**=": Exponentiation,
  "<<=": LeftShift,
  ">>=": RightShift,
  ">>>=": UnsignedRightShift,
  "&=": BitwiseAND,
  "^=": BitwiseXOR,
  "|=": BitwiseOR,
  "&&=": (left: unknown, right: unknown) => left && right,
  "||=": (left: unknown, right: unknown) => left || right,
  "??=": (left: unknown, right: unknown) => left ?? right,
} as const;

/**
 * 代入式を実行する
 * @param script
 * @param scopes
 */
const processAssignmentExpression = (
  script: A_AssignmentExpression,
  scopes: T_scope[],
  trace: A_ANY[]
): unknown => {
  const left = execute(script.left, scopes, trace);
  const right = execute(script.right, scopes, trace);
  const processor = processors[script.operator];
  if (!processor) throw new NotImplementedError(script, scopes);
  const result = processor(left, right);
  assign(script.left, result, scopes, trace);
  return result;
};

export { processAssignmentExpression };
