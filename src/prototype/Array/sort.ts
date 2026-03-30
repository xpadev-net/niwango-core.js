import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processSort: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    const sa = String(a);
    const sb = String(b);
    if (sa < sb) return -1;
    if (sa > sb) return 1;
    return 0;
  });
};

export { processSort };
