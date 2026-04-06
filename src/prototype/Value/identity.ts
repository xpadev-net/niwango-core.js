import type { PrototypeValueFunction } from "@/prototype/Value/index";

const processIdentity: PrototypeValueFunction = (_script, _scopes, object) => {
  return object;
};

export { processIdentity };
