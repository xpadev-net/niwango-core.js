import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import { format } from "@/utils/format";

const processAssign: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const rawIndex = execute(script.arguments[0], scopes, trace);
  let index =
    typeof rawIndex === "number" ? rawIndex : format(rawIndex, "number");
  const value = execute(script.arguments[1], scopes, trace);

  if (index < 0) {
    index = object.length + index;
    if (index < 0) {
      return false;
    }
  }

  object[index] = value;
  return true;
};

export { processAssign };
