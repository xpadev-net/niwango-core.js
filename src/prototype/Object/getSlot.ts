import { execute } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";

import { PrototypeObjectFunction } from "./index";
import { A_ANY } from "@/@types";

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
  trace: A_ANY[]
) => {
  const key = execute(script.arguments[0], scopes, trace);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new InvalidTypeError(
      "[call expression] Object.getSlot: id must be string or number",
      script,
      scopes
    );
  }
  return object[key];
};

export { processGetSlot };
