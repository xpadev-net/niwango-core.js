import type { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import type { IrFunction } from "@/@types/functions";
import { execute } from "@/context";
import { format } from "@/utils/format";

const processTimethis: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _,
  trace: A_ANY[],
) => {
  const start = performance.now();
  const result = execute(script.arguments[0], scopes, trace);
  const elapsed = Math.round(performance.now() - start);
  return `** TIMETHIS RESULT **\n\t+ VALUE: ${format(result, "string")}\n\t+ ${elapsed} msec\n\n`;
};

export { processTimethis };
