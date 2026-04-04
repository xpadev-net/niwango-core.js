import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import { format } from "@/utils/format";

const processAt: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const rawIndex = execute(script.arguments[0], scopes, trace);
  const num =
    typeof rawIndex === "number" ? rawIndex : format(rawIndex, "number");
  if (!Number.isFinite(num)) return undefined;
  let index = Math.trunc(num);
  if (index < 0) {
    index = object.length + index;
  }
  if (index < 0 || index >= object.length) return undefined;
  return object[index];
};

export { processAt };
