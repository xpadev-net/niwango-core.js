import type { A_ANY, A_MemberExpression, T_scope } from "@/@types/ast";
import type { definedFunction } from "@/@types/function";
import { execute, getName } from "@/context";
import { processCallExpression } from "@/processors/CallExpression";
import typeGuard from "@/typeGuard";
import {
  createSlotStore,
  getOwnSlot,
  normalizeSlotKey,
  setOwnSlot,
} from "@/utils/slot";

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
  if (left === undefined) {
    console.error(
      "[member expression] left is undefined",
      script,
      scopes,
      trace,
    );
    return;
  }
  const right = normalizeSlotKey(
    script.computed
      ? execute(script.property, scopes, trace)
      : getName(script.property, scopes, trace),
  );
  if (right === undefined) {
    return;
  }
  const leftSlot = getOwnSlot(left, right);
  if (typeGuard.object(left) && typeGuard.definedFunction(leftSlot)) {
    const func = leftSlot as definedFunction;
    return execute(
      func.script.arguments[1],
      [createSelfScope(left), ...scopes],
      trace,
    );
  }
  if (typeGuard.LambdaExpression(left)) {
    if (typeGuard.SequenceExpression(script.property)) {
      const args = createSlotStore();
      let index = 0;
      for (const arg of script.property.expressions) {
        setOwnSlot(args, `@${index++}`, execute(arg, scopes, trace));
      }
      return execute(left.body, [args, ...left.scopes], trace);
    }
    return execute(
      left.body,
      [createSlotScope("@0", right), ...left.scopes],
      trace,
    );
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
      [createSelfScope(left), ...scopes],
      trace,
    );
  } catch (_e) {
    return getOwnSlot(left, right);
  }
};

const createSelfScope = (self: unknown) => {
  return createSlotScope("self", self);
};

const createSlotScope = (key: string | number, value: unknown) => {
  const scope = createSlotStore();
  setOwnSlot(scope, key, value);
  return scope;
};

export { processMemberExpression };
