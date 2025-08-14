import type { A_ANY } from "@/@types";
import { execute } from "@/context";
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
  if (typeof length !== "undefined") {
    return object.slice(
      format(startIndex, "number"),
      format(startIndex, "number") + format(length, "number"),
    );
  }
  return object.slice(format(startIndex, "number"));
};

export { processSlice };
