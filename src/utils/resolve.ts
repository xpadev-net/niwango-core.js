import type { A_ANY, T_scope } from "@/@types/ast";
import { resultHook } from "@/context";
import typeGuard from "@/typeGuard";
import {
  getOwnSlot,
  hasOwnSlot,
  normalizeSlotKey,
  setOwnSlot,
} from "@/utils/slot";

/**
 * 変数の参照を取得する関数
 * @param script
 * @param scopes
 * @param trace
 */
const resolve = (script: A_ANY, scopes: T_scope[], trace: A_ANY[]) => {
  try {
    if (typeGuard.Identifier(script)) {
      const key = normalizeSlotKey(script.name);
      if (key === undefined || typeof key !== "string") {
        return undefined;
      }
      for (const scope of scopes) {
        if (hasOwnSlot(scope, key)) {
          return processResolveHook(scope, key);
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
  let value = getOwnSlot(scope, name);
  for (const hook of resultHook) {
    value = hook(value);
  }
  setOwnSlot(scope, name, value);
  return value;
};

export { resolve };
