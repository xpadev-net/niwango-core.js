import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processPush: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const values = script.arguments.map((argument) =>
    execute(argument, scopes, trace),
  );
  return object.push(...values);
};

export { processPush };
