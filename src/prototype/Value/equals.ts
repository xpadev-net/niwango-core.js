import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { Equality } from "@/operators";
import type { PrototypeValueFunction } from "@/prototype/Value/index";

const processEquals: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const value = execute(script.arguments[0], scopes, trace);
  return Equality(object, value);
};

export { processEquals };
