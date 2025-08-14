import type { A_ANY, A_VariableDeclaration, T_scope } from "@/@types/ast";
import { execute, getName } from "@/context";

/**
 * 変数宣言を実行する
 * または関数を実行する
 * @param script
 * @param scopes
 */
const processVariableDeclaration = (
  script: A_VariableDeclaration,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  let lastItem: unknown;
  for (const item of script.declarations) {
    if (item.init === null) {
      return execute(item.id, scopes, trace);
    } else {
      if (scopes[0]) {
        lastItem = scopes[0][getName(item.id, scopes, trace) as string] =
          execute(item.init, scopes, trace);
      }
    }
  }
  return lastItem;
};
export { processVariableDeclaration };
