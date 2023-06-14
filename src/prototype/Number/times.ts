import { A_ANY, Argument } from "@/@types/ast";
import { execute } from "@/context";
import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processTimes: PrototypeNumberFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  const body = script.arguments[0] as Argument<A_ANY>;
  let lastResult;
  for (let i = 0; i < Number(object); i++) {
    if (body.type === "LambdaExpression") {
      lastResult = execute(body.body, [{ "@0": i }, ...scopes], trace);
      continue;
    }
    lastResult = execute(body, [{ "@0": i }, ...scopes], trace);
  }
  return lastResult;
};

export { processTimes };
