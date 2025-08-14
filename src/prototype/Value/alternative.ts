import type { A_ANY } from "@/@types";
import { argumentParser, execute } from "@/context";
import type { PrototypeValueFunction } from "@/prototype/Value/index";

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
  if (object && args.then) {
    return execute(args.then, scopes, trace);
  } else if (!object && args.else) {
    return execute(args.else, scopes, trace);
  }
  return;
};

export { processAlternative };
