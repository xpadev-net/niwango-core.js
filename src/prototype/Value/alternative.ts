import type { A_ANY } from "@/@types";
import { argumentParser, execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { isTruthy } from "@/utils/isTruthy";

const processAlternative: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const args = argumentParser(
    script.arguments,
    scopes,
    ["then", "else"],
    trace,
    false,
  );
  if (isTruthy(object) && args.then) {
    return execute(args.then, scopes, trace);
  } else if (!isTruthy(object) && args.else) {
    return execute(args.else, scopes, trace);
  }
  return;
};

export { processAlternative };
