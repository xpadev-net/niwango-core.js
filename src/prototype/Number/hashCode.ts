import type { PrototypeNumberFunction } from "@/prototype/Number/index";

const processHashCode: PrototypeNumberFunction = (_script, _scopes, object) => {
  return object >>> 0;
};

export { processHashCode };
