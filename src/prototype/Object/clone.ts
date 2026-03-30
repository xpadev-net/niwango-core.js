import type { PrototypeObjectFunction } from "./index";

const deepCloneValue = (
  val: unknown,
  seen: WeakMap<object, object>,
): unknown => {
  if (val === null || typeof val !== "object") return val;
  if (seen.has(val as object)) return seen.get(val as object);
  if (Array.isArray(val)) {
    const arr: unknown[] = [];
    seen.set(val, arr);
    for (const item of val) {
      arr.push(deepCloneValue(item, seen));
    }
    return arr;
  }
  return deepCloneObject(val as Record<string, unknown>, seen);
};

const deepCloneObject = (
  obj: Record<string, unknown>,
  seen: WeakMap<object, object>,
): Record<string, unknown> => {
  if (seen.has(obj)) return seen.get(obj) as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  seen.set(obj, result);
  for (const key of Object.keys(obj)) {
    result[key] = deepCloneValue(obj[key], seen);
  }
  return result;
};

/**
 * @関数
 * オブジェクトを再帰的にディープクローンする（WeakMapで循環参照対応）
 * 関数も含めてコピー可能
 */
const processClone: PrototypeObjectFunction = (_script, _scope, object) => {
  return deepCloneObject(object, new WeakMap());
};

export { processClone };
