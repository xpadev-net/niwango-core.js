import { A_ANY, T_scope } from "@/@types/ast";
import typeGuard from "@/typeGuard";

/**
 * 変数の参照を取得する関数
 * @param script
 * @param scopes
 */
const resolve = (script: A_ANY, scopes: T_scope[]) => {
  try {
    if (typeGuard.Identifier(script)) {
      for (const scope of scopes) {
        if (scope[script.name] !== undefined) {
          return scope[script.name];
        }
      }
    }
    return undefined;
  } catch (e) {
    if (e instanceof Error) {
      console.error(`[resolve] ${e.name}: ${e.message}`, script, scopes);
    }
  }
};

export { resolve };
