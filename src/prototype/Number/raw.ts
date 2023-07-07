import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processRaw: PrototypeNumberFunction = (_script, _scopes, object) => {
  return object;
};

export { processRaw };
