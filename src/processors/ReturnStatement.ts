import { A_ANY, A_ReturnStatement, T_scope } from "@/@types/ast";
import { execute } from "@/context";

const processReturnStatement = (
  script: A_ReturnStatement,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  return execute(script.argument, scopes, trace);
};

export { processReturnStatement };
