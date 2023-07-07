import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processIncrease: PrototypeNumberFunction = (_script, _scopes, object) => {
  return object + 1;
};

export { processIncrease };
