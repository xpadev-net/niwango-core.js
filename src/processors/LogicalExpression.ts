import type { A_ANY, A_LogicalExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { isTruthy } from "@/utils/isTruthy";

/**
 * 論理式を実行する
 * @param script
 * @param scopes
 * @param _
 * @param trace
 */
const processLogicalExpression = (
  script: A_LogicalExpression,
  scopes: T_scope[],
  trace: A_ANY[],
): unknown => {
  const left = execute(script.left, scopes, trace);
  if (script.operator === "&&") {
    return isTruthy(left) ? execute(script.right, scopes, trace) : left;
  } else if (script.operator === "||") {
    return isTruthy(left) ? left : execute(script.right, scopes, trace);
  }
  throw new NotImplementedError(script, scopes);
};

export { processLogicalExpression };
