import { A_ANY, A_MemberExpression, T_scope } from "@/@types/ast";
import { definedFunction } from "@/@types/function";
import { getName } from "@/context";
import { execute } from "@/context";
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
  trace: A_ANY[]
) => {
  const left = execute(script.object, scopes, trace);
  if (left === undefined) {
    console.error("[member expression] left is undefined", script, scopes);
    return;
  }
  const right = (
    script.computed
      ? execute(script.property, scopes, trace)
      : getName(script.property, scopes, trace)
  ) as string | number;
  if (typeGuard.object(left) && typeGuard.definedFunction(left[right])) {
    const func = left[right] as definedFunction;
    return execute(
      func.script.arguments[1],
      [{ self: left }, ...scopes],
      trace
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
      scopes,
      trace
    );
  } catch (e) {
    return (left as { [key: string]: unknown })[right];
  }
};

export { processMemberExpression };
