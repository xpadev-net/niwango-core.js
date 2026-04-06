import type { PrototypeStringFunction } from "@/prototype/String/index";

const processToInteger: PrototypeStringFunction = (
  _script,
  _scopes,
  object,
) => {
  // biome-ignore lint/correctness/useParseIntRadix: SWF behavior uses parseInt(raw) with unspecified radix.
  return parseInt(object);
};

export { processToInteger };
