import { A_ANY, A_ArrowFunctionExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";

const processArrowFunctionExpression = (
  script: A_ArrowFunctionExpression,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  return execute(script.body, scopes, trace);
};

export { processArrowFunctionExpression };
