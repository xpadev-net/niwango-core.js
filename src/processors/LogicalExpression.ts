import { A_ANY, A_LogicalExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";

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
  trace: A_ANY[]
): unknown => {
  const left = execute(script.left, scopes, trace);
  const right = execute(script.right, scopes, trace);
  if (script.operator === "&&") {
    return left && right;
  } else if (script.operator === "||") {
    return left || right;
  }
  throw new NotImplementedError(script, scopes);
};

export { processLogicalExpression };
