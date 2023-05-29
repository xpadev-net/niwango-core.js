import { resolvePrototype } from "@/context";
import { UnaryNegation } from "@/operators";
import { getType } from "@/prototype/getType";
import { PrototypeValueFunction } from "@/prototype/Value/index";

const processMinus: PrototypeValueFunction = (script, scopes, object) => {
  const toASNumber = resolvePrototype(getType(object), "toASNumber");
  if (!toASNumber) throw new Error();
  return UnaryNegation(toASNumber(script, scopes, object));
};

export { processMinus };
