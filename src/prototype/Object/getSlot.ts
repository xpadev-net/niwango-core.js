import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { getOwnSlot, normalizeSlotKey } from "@/utils/slot";

import type { PrototypeObjectFunction } from "./index";

/**
 * @関数
 * 関数定義用関数
 * @param script
 * @param scopes
 * @param object
 */
const processGetSlot: PrototypeObjectFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const key = execute(script.arguments[0], scopes, trace);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new InvalidTypeError(
      "[call expression] Object.getSlot: id must be string or number",
      script,
      scopes,
    );
  }
  return getOwnSlot(object, normalizeSlotKey(key));
};

export { processGetSlot };
