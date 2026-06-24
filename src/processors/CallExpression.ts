import type {
  A_ANY,
  A_CallExpression,
  A_MemberExpression,
  Argument,
  T_scope,
} from "@/@types/ast";
import type {
  definedFunction,
  definedKariFunction,
  definedNormalFunction,
} from "@/@types/function";
import type { IrFunction } from "@/@types/functions";
import {
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
import {
  createSlotStore,
  getOwnSlot,
  normalizeSlotKey,
  type SlotKey,
  type SlotStore,
  setOwnSlot,
} from "@/utils/slot";

type DefinedFunctionParameter = {
  name: string;
  slotKey: SlotKey | undefined;
};

const processCallExpression = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[],
) => {
  const callee = getCallee(script, scopes, trace);
  if (callee === undefined) {
    return;
  }
  const object = getThis(script, scopes, trace);
  const objectRef = getOwnSlot(object, callee);
  if (typeGuard.definedFunction(objectRef)) {
    return processDefinedFunction(script, scopes, trace, objectRef, object);
  }
  const objectCallRef = getOwnSlot(objectRef, "call");
  if (typeGuard.definedFunction(objectCallRef)) {
    return processDefinedFunction(script, scopes, trace, objectCallRef, object);
  }
  const self = resolve({ type: "Identifier", name: "self" }, scopes, trace) as {
    [key: string]: unknown;
  };
  const selfRef = getOwnSlot(self, callee);
  if (typeGuard.definedFunction(selfRef)) {
    return processDefinedFunction(script, scopes, trace, selfRef);
  }
  const selfCallRef = getOwnSlot(selfRef, "call");
  if (typeGuard.definedFunction(selfCallRef)) {
    return processDefinedFunction(script, scopes, trace, selfCallRef);
  }
  if (typeof callee === "string") {
    const prototype = resolvePrototype(getType(object), callee);
    if (prototype) {
      return prototype(script, scopes, object, trace);
    }
    const func = getOwnSlot(functions, callee) as IrFunction | undefined;
    if (func) {
      return func(script, scopes, object, trace);
    }
    const definedFunc = getOwnSlot(definedFunctions, callee) as
      | IrFunction
      | undefined;
    if (definedFunc) {
      return definedFunc(script, scopes, object, trace);
    }
  }
  throw new NotImplementedError(script, scopes);
};

const getCallee = (
  script: A_CallExpression,
  scopes: T_scope[],
  trace: A_ANY[],
): SlotKey | undefined => {
  if (typeGuard.MemberExpression(script.callee)) {
    const callee = script.callee as A_MemberExpression;
    return normalizeSlotKey(
      callee.computed
        ? execute(callee.property, scopes, trace)
        : getName(callee.property, scopes, trace),
    );
  }
  return normalizeSlotKey(getName(script.callee, scopes, trace));
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
  const args = createSlotStore();
  let count = 1;
  script.arguments.forEach((val) => {
    if (val?.NIWANGO_Identifier) {
      setOwnSlot(
        args,
        normalizeSlotKey(getName(val.NIWANGO_Identifier, scopes, trace)),
        execute(val, scopes, trace),
      );
    } else {
      setOwnSlot(args, `$${count++}`, execute(val, scopes, trace));
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
  const parameters = func.script.arguments[0].arguments
    .map((arg): DefinedFunctionParameter | undefined => {
      const name = getName(arg, scopes, trace);
      if (typeof name !== "string") {
        return undefined;
      }
      return {
        name,
        slotKey: normalizeSlotKey(name),
      };
    })
    .filter((argName) => argName !== undefined);
  const scopeValues = parseDefinedFunctionArguments(
    script.arguments,
    scopes,
    parameters,
    trace,
  );
  const scope = object
    ? [setScopeSelf(scopeValues, object), object, ...scopes]
    : [scopeValues, ...scopes];
  return execute(func.script.arguments[1], scope, trace);
};

const parseDefinedFunctionArguments = (
  inputs: Argument<A_ANY>[],
  scopes: T_scope[],
  parameters: DefinedFunctionParameter[],
  trace: A_ANY[],
): SlotStore => {
  const result = createSlotStore();
  const assignedKeys = new Set<string>();
  const nonKeyValues: Argument<A_ANY>[] = [];

  for (const item of inputs) {
    if (item.NIWANGO_Identifier) {
      const key = getName(item.NIWANGO_Identifier, scopes, trace);
      if (typeof key === "string") {
        const parameter = parameters.find((param) => param.name === key);
        if (parameter) {
          assignedKeys.add(key);
          setOwnSlot(result, parameter.slotKey, execute(item, scopes, trace));
          continue;
        }
      }
    }
    nonKeyValues.push(item);
  }

  let i = 0;
  for (const parameter of parameters) {
    const value = nonKeyValues[i];
    if (!assignedKeys.has(parameter.name) && value) {
      assignedKeys.add(parameter.name);
      setOwnSlot(result, parameter.slotKey, execute(value, scopes, trace));
      i++;
    }
  }

  return result;
};

const setScopeSelf = (
  scope: SlotStore,
  object: { [k: string]: unknown },
): SlotStore => {
  setOwnSlot(scope, "self", object);
  return scope;
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
