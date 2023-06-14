import { argumentParser } from "@/context";
import { execute } from "@/context";
import { PrototypeValueFunction } from "@/prototype/Value/index";
import { A_ANY } from "@/@types";

const processAlternative: PrototypeValueFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const args = argumentParser(
    script.arguments,
    scopes,
    ["then", "else"],
    trace,
    false
  );
  if (object && args.then) {
    return execute(args.then, scopes, trace);
  } else if (!object && args.else) {
    return execute(args.else, scopes, trace);
  }
  return;
};

export { processAlternative };
