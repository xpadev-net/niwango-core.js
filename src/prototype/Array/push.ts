import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processPush: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const value = execute(script.arguments[0], scopes, trace);
  object.push(value);
  return object;
};

export { processPush };
