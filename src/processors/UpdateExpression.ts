import type { A_ANY, A_UpdateExpression, T_scope } from "@/@types/ast";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { Addition, Subtraction } from "@/operators";
import { resolveReference } from "@/utils/reference";

/**
 * 更新式を実行する
 * @param script
 * @param scopes
 */
const processUpdateExpression = (
  script: A_UpdateExpression,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  const reference = resolveReference(script.argument, scopes, trace);
  const value = reference?.get();
  if (script.operator === "--") {
    const result = Subtraction(value, 1);
    reference?.set(result);
    if (script.prefix) {
      return result;
    } else {
      return value;
    }
  } else if (script.operator === "++") {
    const result = Addition(value, 1);
    reference?.set(result);
    if (script.prefix) {
      return result;
    } else {
      return value;
    }
  }
  throw new NotImplementedError(script, scopes);
};

export { processUpdateExpression };
