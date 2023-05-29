import { A_CallExpression, T_scope } from "@/@types/ast";
import { IrFunction } from "@/@types/functions";
import { execute } from "@/context";

/**
 * @非標準
 * @関数
 * デバッグ用関数
 * @param script
 * @param scopes
 */
const processDump: IrFunction = (
  script: A_CallExpression,
  scopes: T_scope[]
) => {
  for (const argument of script.arguments) {
    console.debug("%cdump", "background:green;", execute(argument, scopes));
  }
};

export { processDump };
