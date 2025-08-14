import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { format } from "@/utils/format";

const processNot: PrototypeValueFunction = (_script, _scopes, object) => {
  return !format(object, "boolean");
};

export { processNot };
