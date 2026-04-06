import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { format } from "@/utils/format";

const normalizeStringIndex = (index: number, length: number): number => {
  if (!Number.isFinite(index) || length <= 0 || index >= 0) return index;
  return ((index % length) + length) % length;
};

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
  const idx = normalizeStringIndex(raw, object.length);
  if (object.length < idx) return null;
  if (object.length === idx) return "";
  return object.charAt(idx);
};

export { normalizeStringIndex, processIndex };
