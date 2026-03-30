import type { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import type { IrFunction } from "@/@types/functions";
import { execute } from "@/context";
import { isTruthy } from "@/utils/isTruthy";

/**
 * @関数
 * whileループ用関数
 * @param script
 * @param scopes
 * @param _
 * @param trace
 */
const processWhileKari: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _,
  trace: A_ANY[],
) => {
  if (!(script.arguments[0] && script.arguments[1])) {
    return;
  }
  let result: unknown;
  let loopCount = 0;
  while (
    loopCount++ < 10000 &&
    isTruthy(execute(script.arguments[0], scopes, trace))
  ) {
    result = execute(script.arguments[1], scopes, trace);
  }
  return result;
};

export { processWhileKari };
