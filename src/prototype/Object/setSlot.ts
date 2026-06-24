import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { normalizeSlotKey, setOwnSlot } from "@/utils/slot";

import type { PrototypeObjectFunction } from "./index";

/**
 * @関数
 * 関数定義用関数
 * @param script
 * @param scopes
 * @param object
 */
const processSetSlot: PrototypeObjectFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const key = execute(script.arguments[0], scopes, trace);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new InvalidTypeError(
      "[call expression] Object.setSlot: id must be string or number",
      script,
      scopes,
    );
  }
  const value = execute(script.arguments[1], scopes, trace);
  if (!setOwnSlot(object, normalizeSlotKey(key), value)) {
    return;
  }
  return value;
};

export { processSetSlot };
