import { A_ANY, A_UnaryExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { BitwiseNOT, LogicalNot, UnaryNegation, UnaryPlus } from "@/operators";

/**
 * 単項式を実行する
 * @param script
 * @param scopes
 */
const processUnaryExpression = (
  script: A_UnaryExpression,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  const value = execute(script.argument, scopes, trace);
  if (script.operator === "-") {
    return UnaryNegation(value);
  } else if (script.operator === "+") {
    return UnaryPlus(value);
  } else if (script.operator === "~") {
    return BitwiseNOT(value);
  } else if (script.operator === "!") {
    return LogicalNot(value);
  }
  throw new NotImplementedError(script, scopes);
};

export { processUnaryExpression };
