import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

const processIndex: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const index = execute(script.arguments[0], scopes, trace);
  const raw = format(index, "number");
  if (!Number.isFinite(raw)) return null;
  if (object.length === 0) return raw === 0 ? "" : null;
  const idx = ((raw % object.length) + object.length) % object.length;
  return object.charAt(idx);
};

export { processIndex };
