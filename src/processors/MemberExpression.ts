import type { A_ANY, A_MemberExpression, T_scope } from "@/@types/ast";
import type { definedFunction } from "@/@types/function";
import { execute, getName } from "@/context";
import { InvalidTypeError } from "@/errors/InvalidTypeError";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { processCallExpression } from "@/processors/CallExpression";
import typeGuard from "@/typeGuard";

/**
 * 配列やオブジェクトを処理する
 * @param script
 * @param scopes
 */
const processMemberExpression = (
  script: A_MemberExpression,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  const left = execute(script.object, scopes, trace);
  if (left == null) {
    throw new InvalidTypeError(
      `Cannot access property of ${left === null ? "null" : "undefined"}`,
      script,
      scopes,
      { trace },
    );
  }
  const right = (
    script.computed
      ? execute(script.property, scopes, trace)
      : getName(script.property, scopes, trace)
  ) as string | number;
  if (typeGuard.object(left) && typeGuard.definedFunction(left[right])) {
    const func = left[right] as definedFunction;
    if (!func.script.arguments[1]) return undefined;
    return execute(
      func.script.arguments[1],
      [{ self: left }, ...scopes],
      trace,
    );
  }
  if (typeGuard.LambdaExpression(left)) {
    if (typeGuard.SequenceExpression(script.property)) {
      const args: { [key: string]: unknown } = {};
      let index = 0;
      for (const arg of script.property.expressions) {
        args[`@${index++}`] = execute(arg, scopes, trace);
      }
      return execute(left.body, [args, ...left.scopes], trace);
    }
    return execute(left.body, [{ "@0": right }, ...left.scopes], trace);
  }
  try {
    return processCallExpression(
      {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: {
            type: "Raw",
            value: left,
          },
          property: {
            type: "Raw",
            value: right,
          },
          computed: false,
        },
        arguments: [],
      },
      [{ self: left }, ...scopes],
      trace,
    );
  } catch (e) {
    if (e instanceof NotImplementedError) {
      return (left as { [key: string]: unknown })[right];
    }
    throw e;
  }
};

export { processMemberExpression };
