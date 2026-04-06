import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { normalizeStringIndex } from "@/prototype/String/_index";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

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
  if (typeof length !== "undefined") {
    return object.substr(start, format(length, "number"));
  }
  return object.substr(start);
};

export { processSlice };
