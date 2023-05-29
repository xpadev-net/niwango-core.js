import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processSin: PrototypeNumberFunction = (_script, _scopes, object) => {
  return Math.sin(object);
};

export { processSin };
