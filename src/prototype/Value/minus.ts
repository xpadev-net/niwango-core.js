import { UnaryNegation } from "@/operators";
import type { PrototypeValueFunction } from "@/prototype/Value/index";
import { format } from "@/utils/format";

const processMinus: PrototypeValueFunction = (_script, _scopes, object) => {
  return UnaryNegation(format(object, "number"));
};

export { processMinus };
