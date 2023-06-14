import {
  A_ANY,
  A_CallExpression,
  A_MemberExpression,
  T_scope,
} from "@/@types/ast";
import { definedFunction } from "@/@types/function";
import {
  argumentParser,
  definedFunctions,
  execute,
  getName,
  resolvePrototype,
} from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { functions } from "@/functions";
import { getType } from "@/prototype/getType";
import typeGuard from "@/typeGuard";
import { getGlobalScope, resolve } from "@/utils";

const processCallExpression = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  const isMemberExpression = typeGuard.MemberExpression(script.callee);
  const callee = getName(
    isMemberExpression
      ? (script.callee as A_MemberExpression).property
      : script.callee,
    scopes,
    trace
  ) as string;
  const object = getThis(script, scopes, trace);
  const prototype = resolvePrototype(getType(object), callee);
  if (prototype) {
    return prototype(script, scopes, object, trace);
  }
  const func = functions[callee];
  if (func) {
    return func(script, scopes, object, trace);
  }
  const definedFunc = definedFunctions[callee];
  if (definedFunc) {
    return definedFunc(script, scopes, object, trace);
  }
  if (
    object?.[callee] &&
    (object?.[callee] as definedFunction)?.type === "definedFunction"
  ) {
    const func = object[callee] as definedFunction;
    if (func.isKari) {
      const args: { [key: string]: unknown } = {};
      let count = 1;
      script.arguments.forEach((val) => {
        if (val?.NIWANGO_Identifier) {
          args[getName(val.NIWANGO_Identifier, scopes, trace) as string] =
            execute(val, scopes, trace);
        } else {
          args[`$${count++}`] = execute(val, scopes, trace);
        }
      });
      return execute(func.script.arguments[1], [args, ...scopes], trace);
    } else {
      const argNames = func.script.arguments[0].arguments.map(
        (arg) => getName(arg, scopes, trace) as string
      );
      const args = argumentParser(script.arguments, scopes, argNames, trace);
      return execute(
        func.script.arguments[1],
        [{ ...args, self: object }, object, ...scopes],
        trace
      );
    }
  }
  const self = resolve({ type: "Identifier", name: "self" }, scopes) as {
    [key: string]: unknown;
  };
  if (
    self?.[callee] &&
    (self?.[callee] as definedFunction)?.type === "definedFunction"
  ) {
    const func = self[callee] as definedFunction;
    if (func.isKari) {
      const args: { [key: string]: unknown } = {};
      let count = 1;
      script.arguments.forEach((val) => {
        if (val?.NIWANGO_Identifier) {
          args[getName(val.NIWANGO_Identifier, scopes, trace) as string] =
            execute(val, scopes, trace);
        } else {
          args[`$${count++}`] = execute(val, scopes, trace);
        }
      });
      return execute(func.script.arguments[1], [args, ...scopes], trace);
    } else {
      const argNames = func.script.arguments[0].arguments.map(
        (arg) => getName(arg, scopes, trace) as string
      );
      const args = argumentParser(script.arguments, scopes, argNames, trace);
      return execute(func.script.arguments[1], [{ ...args }, ...scopes], trace);
    }
  }
  throw new NotImplementedError(script, scopes);
};

/**
 * 参照を取るための関数
 * @param script
 * @param scopes
 * @param trace
 */
const getThis = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[]
): { [key: string]: unknown } => {
  if (typeGuard.MemberExpression(script.callee))
    return execute(script.callee.object, scopes, trace) as {
      [key: string]: unknown;
    };
  return getGlobalScope(scopes) as { [key: string]: unknown };
};

export { processCallExpression };
