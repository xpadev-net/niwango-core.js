import { UnaryPlus } from "@/operators";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { format } from "@/utils/format";

const processPlus: PrototypeValueFunction = (_script, _scopes, object) => {
  return UnaryPlus(format(object, "number"));
};

export { processPlus };
