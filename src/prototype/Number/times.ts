import type { A_ANY, Argument } from "@/@types/ast";
import { execute } from "@/context";
import type { PrototypeNumberFunction } from "@/prototype/Number/index";
import { format } from "@/utils/format";

const processTimes: PrototypeNumberFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const body = script.arguments[0] as Argument<A_ANY>;
  let lastResult: unknown;
  for (let i = 0; i < format(object, "number"); i++) {
    if (body.type === "LambdaExpression") {
      lastResult = execute(body.body, [{ "@0": i }, ...scopes], trace);
      continue;
    }
    lastResult = execute(body, [{ "@0": i }, ...scopes], trace);
  }
  return lastResult;
};

export { processTimes };
