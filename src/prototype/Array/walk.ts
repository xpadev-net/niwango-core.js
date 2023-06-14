import { execute } from "@/context";
import { PrototypeArrayFunction } from "@/prototype/Array/index";
import typeGuard from "@/typeGuard";

const processWalk: PrototypeArrayFunction = (script, scopes, object) => {
  const processor = script.arguments[0];
  for (const item of object) {
    if (typeGuard.LambdaExpression(processor)) {
      return execute(processor.body, [{ "@0": item }, ...scopes]);
    }
  }
};

export { processWalk };
