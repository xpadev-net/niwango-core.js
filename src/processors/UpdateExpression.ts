import type { A_ANY, A_UpdateExpression, T_scope } from "@/@types/ast";
import { assign, execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";

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
  const value = execute(script.argument, scopes, trace);
  if (script.operator === "++" || script.operator === "--") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return value;
    }
    const result = script.operator === "++" ? numeric + 1 : numeric - 1;
    assign(script.argument, result, scopes, trace);
    return script.prefix ? result : value;
  }
  throw new NotImplementedError(script, scopes);
};

export { processUpdateExpression };
