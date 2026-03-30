import type { PrototypeObjectFunction } from "./index";

const deepClone = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item !== null && typeof item === "object" && !Array.isArray(item)
          ? deepClone(item as Record<string, unknown>)
          : item,
      );
    } else if (val !== null && typeof val === "object") {
      result[key] = deepClone(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
};

/**
 * @関数
 * 関数定義用関数
 * @param _script
 * @param _scope
 * @param object
 */
const processClone: PrototypeObjectFunction = (_script, _scope, object) => {
  return deepClone(object);
};

export { processClone };
