import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeStringFunction } from "@/prototype/String/index";

const processMultiply: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const repeatCount = execute(script.arguments[0], scopes, trace);
  if (
    typeof repeatCount !== "number" ||
    repeatCount < 0 ||
    !Number.isFinite(repeatCount)
  ) {
    return null;
  }
  return object.repeat(Math.floor(repeatCount));
};

export { processMultiply };
