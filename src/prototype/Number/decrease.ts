import { PrototypeNumberFunction } from "@/prototype/Number/index";

const processDecrease: PrototypeNumberFunction = (_script, _scopes, object) => {
  return object - 1;
};

export { processDecrease };
