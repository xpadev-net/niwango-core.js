import type { PrototypeArrayFunction } from "@/prototype/Array/index";

const processPop: PrototypeArrayFunction = (_script, _scopes, object) => {
  return object.length === 0 ? null : object.pop();
};

export { processPop };
