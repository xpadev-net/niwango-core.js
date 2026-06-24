import type { A_ANY, T_scope } from "@/@types/ast";
import { execute, getName } from "@/context";
import typeGuard from "@/typeGuard";
import { getOwnSlot, hasOwnSlot, normalizeSlotKey, setOwnSlot } from "./slot";

type Reference = {
  get: () => unknown;
  set: (value: unknown) => void;
};

const resolveReference = (
  target: A_ANY,
  scopes: T_scope[],
  trace: A_ANY[],
): Reference | undefined => {
  if (scopes.length < 1) {
    return undefined;
  }
  if (typeGuard.Identifier(target)) {
    const key = normalizeSlotKey(target.name);
    if (key === undefined) {
      return undefined;
    }
    for (const scope of scopes) {
      if (hasOwnSlot(scope, key)) {
        return createSlotReference(scope, key, () =>
          execute(target, scopes, trace),
        );
      }
    }
    return createSlotReference(scopes[0], key, () =>
      execute(target, scopes, trace),
    );
  }
  if (typeGuard.MemberExpression(target)) {
    const left = execute(target.object, scopes, trace);
    if (!typeGuard.object(left)) {
      console.error("[reference] left is not object", target, scopes, trace);
      return undefined;
    }
    const key = normalizeSlotKey(
      target.computed
        ? execute(target.property, scopes, trace)
        : getName(target.property, scopes, trace),
    );
    return createSlotReference(left, key, () =>
      execute(
        {
          type: "MemberExpression",
          object: {
            type: "Raw",
            value: left,
          },
          property: {
            type: "Raw",
            value: key,
          },
          computed: false,
        },
        scopes,
        trace,
      ),
    );
  }
  return undefined;
};

const createSlotReference = (
  target: unknown,
  key: string | number | undefined,
  get: () => unknown = () => getOwnSlot(target, key),
): Reference => {
  return {
    get,
    set: (value: unknown) => {
      setOwnSlot(target, key, value);
    },
  };
};

export { resolveReference };
export type { Reference };
