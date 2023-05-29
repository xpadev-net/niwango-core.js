import { PrototypeBoolFunction } from "@/prototype/Bool/index";

const processToASNumber: PrototypeBoolFunction = (_script, _scopes, object) => {
  return object ? 1 : 0;
};

export { processToASNumber };
