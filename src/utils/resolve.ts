import type { A_ANY, T_scope } from "@/@types/ast";
import { resultHook } from "@/context";
import typeGuard from "@/typeGuard";

/**
 * 変数の参照を取得する関数
 * @param script
 * @param scopes
 * @param trace
 */
const resolve = (script: A_ANY, scopes: T_scope[], trace: A_ANY[]) => {
  try {
    if (typeGuard.Identifier(script)) {
      for (const scope of scopes) {
        if (scope[script.name] !== undefined) {
          return processResolveHook(scope, script.name);
        }
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`[resolve] ${e.name}: ${e.message}`, script, scopes, trace);
    }
  }
  return undefined;
};

const processResolveHook = (scope: T_scope, name: string) => {
  let value = scope[name];
  for (const hook of resultHook) {
    value = hook(value);
  }
  scope[name] = value;
  return value;
};

export { resolve };
