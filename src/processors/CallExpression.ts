import type {
  A_ANY,
  A_CallExpression,
  A_MemberExpression,
  T_scope,
} from "@/@types/ast";
import type {
  definedFunction,
  definedKariFunction,
  definedNormalFunction,
} from "@/@types/function";
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
  trace: A_ANY[],
) => {
  const isMemberExpression = typeGuard.MemberExpression(script.callee);
  const callee = getName(
    isMemberExpression
      ? (script.callee as A_MemberExpression).property
      : script.callee,
    scopes,
    trace,
  ) as string;
  const object = getThis(script, scopes, trace);
  const objectRef = object?.[callee];
  if (typeGuard.definedFunction(objectRef)) {
    return processDefinedFunction(script, scopes, trace, objectRef, object);
  }
  const objectCallRef = (object?.[callee] as { [k: string]: unknown })?.call;
  if (typeGuard.definedFunction(objectCallRef)) {
    return processDefinedFunction(script, scopes, trace, objectCallRef, object);
  }
  const self = resolve({ type: "Identifier", name: "self" }, scopes, trace) as {
    [key: string]: unknown;
  };
  const selfRef = self?.[callee];
  if (typeGuard.definedFunction(selfRef)) {
    return processDefinedFunction(script, scopes, trace, selfRef);
  }
  const selfCallRef = (self?.[callee] as { [k: string]: unknown })?.call;
  if (typeGuard.definedFunction(selfCallRef)) {
    return processDefinedFunction(script, scopes, trace, selfCallRef);
  }
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
  throw new NotImplementedError(script, scopes);
};

const processDefinedFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[],
  func: definedFunction,
  object?: { [k: string]: unknown },
) => {
  if (func.isKari) {
    return processDefinedKariFunction(script, scopes, trace, func);
  } else {
    return processDefinedNormalFunction(script, scopes, trace, func, object);
  }
};

const processDefinedKariFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[],
  func: definedKariFunction,
) => {
  const args: { [key: string]: unknown } = {};
  let count = 1;
  script.arguments.forEach((val) => {
    if (val?.NIWANGO_Identifier) {
      args[getName(val.NIWANGO_Identifier, scopes, trace) as string] = execute(
        val,
        scopes,
        trace,
      );
    } else {
      args[`$${count++}`] = execute(val, scopes, trace);
    }
  });
  return execute(func.script.arguments[1], [args, ...scopes], trace);
};

const processDefinedNormalFunction = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[],
  func: definedNormalFunction,
  object?: { [k: string]: unknown },
) => {
  const argNames = func.script.arguments[0].arguments.map(
    (arg) => getName(arg, scopes, trace) as string,
  );
  const args = argumentParser(script.arguments, scopes, argNames, trace);
  const scope = object
    ? [{ ...args, self: object }, object, ...scopes]
    : [{ ...args }, ...scopes];
  return execute(func.script.arguments[1], scope, trace);
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
  trace: A_ANY[],
): { [key: string]: unknown } => {
  if (typeGuard.MemberExpression(script.callee))
    return execute(script.callee.object, scopes, trace) as {
      [key: string]: unknown;
    };
  return getGlobalScope(scopes) as { [key: string]: unknown };
};

export { processCallExpression };
