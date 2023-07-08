import { A_ANY } from "@/@types";
import { execute } from "@/context";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processWhileKari: PrototypeValueFunction = (
  script,
  scopes,
  _,
  trace: A_ANY[]
) => {
  let result: unknown;
  while (execute(script.arguments[0], scopes, trace) as boolean) {
    result = execute(script.arguments[1], scopes, trace);
  }
  return result;
};

export { processWhileKari };
