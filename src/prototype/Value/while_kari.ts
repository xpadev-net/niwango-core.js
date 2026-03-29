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
    (execute(script.arguments[0], scopes, trace) as boolean) &&
    loopCount++ < 10000
  ) {
    // eslint-disable-next-line prefer-const
    result = execute(script.arguments[1], scopes, trace);
  }
  return result;
};

export { processWhileKari };
