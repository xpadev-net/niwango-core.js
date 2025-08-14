import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import { format } from "@/utils/format";

const processIndex: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace,
) => {
  const index = execute(script.arguments[0], scopes, trace);
  if (typeof index === "number") {
    return object[index];
  }
  return object[format(index, "number")];
};

export { processIndex };
