import { A_ANY, A_CallExpression, T_scope } from "@/@types/ast";
import { IrFunction } from "@/@types/functions";
import { execute } from "@/context";

/**
 * @非標準
 * @関数
 * デバッグ用関数
 * @param script
 * @param scopes
 * @param _object
 * @param trace
 */
const processDump: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  _object,
  trace: A_ANY[]
) => {
  for (const argument of script.arguments) {
    console.debug(
      "%cdump",
      "background:green;",
      execute(argument, scopes, trace)
    );
  }
};

export { processDump };
