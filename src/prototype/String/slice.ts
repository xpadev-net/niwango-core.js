import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { normalizeStringIndex } from "@/prototype/String/_index";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

const toIntegerOrInfinity = (value: number): number => {
  if (Number.isNaN(value) || value === 0) return 0;
  if (!Number.isFinite(value)) return value;
  return Math.trunc(value);
};

const processSlice: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const startIndex = execute(script.arguments[0], scopes, trace);
  const length = execute(script.arguments[1], scopes, trace);
  const start = normalizeStringIndex(
    format(startIndex, "number"),
    object.length,
  );
  if (start >= object.length) return "";
  const normalizedStart =
    Number.isNaN(start) || start === Number.NEGATIVE_INFINITY ? 0 : start;
  if (typeof length !== "undefined") {
    const normalizedLength = toIntegerOrInfinity(format(length, "number"));
    if (normalizedLength <= 0) return "";
    return object.slice(normalizedStart, normalizedStart + normalizedLength);
  }
  return object.slice(normalizedStart);
};

export { processSlice };
