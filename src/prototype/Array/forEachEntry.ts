import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import typeGuard from "@/typeGuard";

const processForEachEntry: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const processor = script.arguments[0];
  if (typeGuard.LambdaExpression(processor)) {
    for (const item of object) {
      execute(processor.body, [{ "@0": item }, ...scopes], trace);
    }
  }
  return object;
};

export { processForEachEntry };
