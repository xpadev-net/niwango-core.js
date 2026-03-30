import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";

const processWhileKari: PrototypeValueFunction = (
  script,
  scopes,
  _,
  trace: A_ANY[],
) => {
  let result: unknown;
  let loopCount = 0;
  while (
    loopCount++ < 10000 &&
    (execute(script.arguments[0], scopes, trace) as boolean)
  ) {
    result = execute(script.arguments[1], scopes, trace);
  }
  return result;
};

export { processWhileKari };
