import type { A_ANY, A_ObjectExpression, T_scope } from "@/@types/ast";
import { execute, getName } from "@/context";
import { createSlotStore, normalizeSlotKey, setOwnSlot } from "@/utils/slot";

/**
 * オブジェクトを作成する
 * @param script
 * @param scopes
 */
const processObjectExpression = (
  script: A_ObjectExpression,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  const object = createSlotStore();
  for (const item of script.properties) {
    const key = normalizeSlotKey(getName(item.key, scopes, trace));
    const value = execute(item.value, scopes, trace);
    setOwnSlot(object, key, value);
  }
  return object;
};

export { processObjectExpression };
