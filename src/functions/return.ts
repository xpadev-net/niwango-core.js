import type { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import type { IrFunction } from "@/@types/functions";
import { execute } from "@/context";

/**
 * @関数
 * whileループ用関数
 * @param script
 * @param scopes
 * @param _
 * @param trace
 */
const processReturn: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _,
  trace: A_ANY[],
) => {
  return execute(script.arguments[0], scopes, trace);
};

export { processReturn };
