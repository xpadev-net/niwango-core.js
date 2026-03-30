import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processSort: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  });
};

export { processSort };
