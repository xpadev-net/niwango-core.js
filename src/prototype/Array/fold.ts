import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import typeGuard from "@/typeGuard";

const processFold: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const initial = execute(script.arguments[0], scopes, trace);
  const processor = script.arguments[1];
  if (!typeGuard.LambdaExpression(processor)) {
    return initial;
  }
  let accumulator = initial;
  for (const item of object) {
    accumulator = execute(
      processor.body,
      [{ "@0": accumulator, "@1": item }, ...scopes],
      trace,
    );
  }
  return accumulator;
};

export { processFold };
