import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processShift: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.length === 0 ? null : object.shift();
};

export { processShift };
