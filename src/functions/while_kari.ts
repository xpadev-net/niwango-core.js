import { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import { IrFunction } from "@/@types/functions";
import { execute } from "@/context";

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
  trace: A_ANY[]
) => {
  if (!(script.arguments[0] && script.arguments[1])) {
    return;
  }
  let loopCount = 0;
  while (execute(script.arguments[0], scopes, trace) && loopCount++ <= 10000) {
    execute(script.arguments[1], scopes, trace);
  }
};

export { processWhileKari };
