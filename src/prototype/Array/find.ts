import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { LooseEquality } from "@/operators";
import type { PrototypeArrayFunction } from "@/prototype/Array/index";
import typeGuard from "@/typeGuard";
import { isTruthy } from "@/utils/isTruthy";

const processFind: PrototypeArrayFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const processor = script.arguments[0];
  if (typeGuard.LambdaExpression(processor)) {
    for (let i = 0; i < object.length; i++) {
      const result = execute(
        processor.body,
        [{ "@0": object[i] }, ...scopes],
        trace,
      );
      if (isTruthy(result)) return i;
    }
    return -1;
  }
  const target = execute(processor, scopes, trace);
  return object.findIndex((item) => LooseEquality(item, target));
};

export { processFind };
