import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeStringFunction } from "@/prototype/String/index";
import { sprintf } from "@/utils/sprintf";

const processModulo: PrototypeStringFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const value = execute(script.arguments[0], scopes, trace);
  if (!Array.isArray(value)) return null;
  return sprintf(object, value);
};

export { processModulo };
