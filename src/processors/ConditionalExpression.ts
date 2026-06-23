import type { A_ANY, A_ConditionalExpression, T_scope } from "@/@types/ast";
import { execute } from "@/context";

const processConditionalExpression = (
  script: A_ConditionalExpression,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  const test = execute(script.test, scopes, trace);
  return execute(test ? script.consequent : script.alternate, scopes, trace);
};

export { processConditionalExpression };
