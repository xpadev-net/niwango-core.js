import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { PrototypeArrayFunction } from "@/prototype/Array/index";

const processPush: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const value = execute(script.arguments[0], scopes, trace);
  return object.push(value);
};

export { processPush };
