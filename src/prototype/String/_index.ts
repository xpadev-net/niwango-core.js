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
  let idx = format(index, "number");
  while (idx < 0) idx += object.length;
  if (idx > object.length) return null;
  if (idx === object.length) return "";
  return object.charAt(idx);
};

export { processIndex };
