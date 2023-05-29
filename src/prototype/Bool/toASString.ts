import { PrototypeBoolFunction } from "@/prototype/Bool/index";

const processToASString: PrototypeBoolFunction = (_script, _scopes, object) => {
  return object ? "true" : "false";
};

export { processToASString };
