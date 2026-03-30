import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { format } from "@/utils/format";

const processHasSlot: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  if (object === null || object === undefined || typeof object !== "object")
    return false;
  if (!script.arguments || script.arguments.length === 0) return true;
  const name = execute(script.arguments[0], scopes, trace);
  if (name === null || name === undefined) return true;
  return format(name, "string") in (object as Record<string, unknown>);
};

export { processHasSlot };
