import { A_ANY, A_ExpressionStatement, T_scope } from "@/@types/ast";
import { execute } from "@/context";

const processExpressionStatement = (
  script: A_ExpressionStatement,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  return execute(script.expression, scopes, trace);
};

export { processExpressionStatement };
