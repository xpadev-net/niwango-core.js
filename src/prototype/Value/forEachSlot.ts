import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import typeGuard from "@/typeGuard";
import { createSlotStore, normalizeSlotKey, setOwnSlot } from "@/utils/slot";

const processForEachSlot: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const processor = script.arguments[0];
  if (
    !typeGuard.LambdaExpression(processor) ||
    typeof object !== "object" ||
    object === null
  ) {
    return;
  }

  let result: unknown;
  const slots = object as Record<string, unknown>;
  for (const key of Object.keys(object)) {
    const slotKey = normalizeSlotKey(
      Array.isArray(object) && isArrayIndex(key) ? Number(key) : key,
    );
    if (slotKey === undefined) {
      continue;
    }
    const slotScope = createSlotStore();
    setOwnSlot(slotScope, "@0", slotKey);
    setOwnSlot(slotScope, "@1", slots[key]);
    result = execute(processor.body, [slotScope, ...scopes], trace);
  }
  return result;
};

const isArrayIndex = (key: string): boolean => {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && String(index) === key;
};

export { processForEachSlot };
