import type { A_ANY, Argument } from "@/@types/ast";
import { execute } from "@/context";
import type { PrototypeNumberFunction } from "@/prototype/Number/index";
import typeGuard from "@/typeGuard";
import { format } from "@/utils/format";

const processTimes: PrototypeNumberFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  const body = script.arguments[0] as Argument<A_ANY> | undefined;
  if (!body || typeGuard.Literal(body)) return null;

  const iterationCount = format(object, "number");
  if (!(iterationCount > 0)) return null;

  const lambdaProcessor = typeGuard.LambdaExpression(body)
    ? execute(body, scopes, trace)
    : typeGuard.Identifier(body) || typeGuard.MemberExpression(body)
      ? execute(body, scopes, trace)
      : null;

  if (
    (typeGuard.Identifier(body) || typeGuard.MemberExpression(body)) &&
    !typeGuard.LambdaExpression(lambdaProcessor)
  ) {
    return null;
  }

  let lastResult: unknown = null;
  for (let i = 0; i < iterationCount; i++) {
    if (typeGuard.LambdaExpression(lambdaProcessor)) {
      lastResult = execute(
        lambdaProcessor.body,
        [{ "@0": i }, ...lambdaProcessor.scopes],
        trace,
      );
      continue;
    }
    lastResult = execute(body, [{ "@0": i }, ...scopes], trace);
  }
  return lastResult;
};

export { processTimes };
